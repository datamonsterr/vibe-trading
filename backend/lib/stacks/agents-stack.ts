import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as path from 'path';
import { AgentConstruct } from '../constructs/agent-construct';

export interface AgentsStackProps extends cdk.NestedStackProps {
  /**
   * DynamoDB tables
   */
  ordersTable: dynamodb.ITable;
  stockDataTable: dynamodb.ITable;
  chatHistoryTable: dynamodb.ITable;
  newsTable: dynamodb.ITable;
  technicalReportsTable: dynamodb.ITable;

  /**
   * S3 bucket for analysis
   */
  analysisBucket: s3.IBucket;
}

/**
 * Nested stack for all agent Lambda functions
 */
export class AgentsStack extends cdk.NestedStack {
  public readonly chatAgent: AgentConstruct;
  public readonly stockDataAgent: AgentConstruct;
  public readonly technicalAnalysisAgent: AgentConstruct;
  public readonly newsAnalysisAgent: AgentConstruct;
  public readonly orderAgent: AgentConstruct;

  constructor(scope: Construct, id: string, props: AgentsStackProps) {
    super(scope, id, props);

    // Create IAM role for Lambda functions with Bedrock access
    const lambdaRole = new iam.Role(this, 'AgentLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Add Bedrock permissions
    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'bedrock:InvokeModel',
          'bedrock:InvokeModelWithResponseStream',
        ],
        resources: ['*'],
      })
    );

    // Common environment variables
    const commonEnv = {
      ORDERS_TABLE_NAME: props.ordersTable.tableName,
      STOCK_DATA_TABLE_NAME: props.stockDataTable.tableName,
      CHAT_HISTORY_TABLE_NAME: props.chatHistoryTable.tableName,
      NEWS_TABLE_NAME: props.newsTable.tableName,
      TECHNICAL_REPORTS_TABLE_NAME: props.technicalReportsTable.tableName,
      ANALYSIS_BUCKET_NAME: props.analysisBucket.bucketName,
    };

    // ==================== NEWS AGENT ====================
    // Runs every 30 minutes to fetch news
    this.newsAnalysisAgent = new AgentConstruct(this, 'NewsAgent', {
      agentName: 'news-analysis',
      description: 'Fetches and analyzes news with sentiment scoring',
      codePath: path.join(__dirname, '../../lambda/news-analysis'),
      environment: commonEnv,
      memorySize: 512,
      timeout: 120,
      createQueue: true,  // For async processing
      schedule: {
        rate: cdk.Duration.minutes(30),  // Fetch news every 30 minutes
      },
      lambdaRole,
    });

    // Grant table access
    props.newsTable.grantReadWriteData(this.newsAnalysisAgent.lambda);
    props.analysisBucket.grantReadWrite(this.newsAnalysisAgent.lambda);

    // ==================== TECHNICAL ANALYSIS AGENT ====================
    // Runs daily to fetch technical reports
    this.technicalAnalysisAgent = new AgentConstruct(this, 'TechnicalAnalysisAgent', {
      agentName: 'technical-analysis',
      description: 'Fetches technical reports from securities companies',
      codePath: path.join(__dirname, '../../lambda/technical-analysis'),
      environment: commonEnv,
      memorySize: 512,
      timeout: 120,
      createQueue: true,  // For batch processing
      schedule: {
        rate: cdk.Duration.hours(24),  // Fetch reports daily
      },
      lambdaRole,
    });

    // Grant table access
    props.technicalReportsTable.grantReadWriteData(this.technicalAnalysisAgent.lambda);
    props.stockDataTable.grantReadData(this.technicalAnalysisAgent.lambda);
    props.analysisBucket.grantReadWrite(this.technicalAnalysisAgent.lambda);

    // ==================== STOCK DATA AGENT ====================
    this.stockDataAgent = new AgentConstruct(this, 'StockDataAgent', {
      agentName: 'stock-data',
      description: 'Fetches stock data using vnstock and market APIs',
      codePath: path.join(__dirname, '../../lambda/stock-data-handler'),
      environment: commonEnv,
      memorySize: 256,
      timeout: 30,
      lambdaRole,
    });

    // Grant table access
    props.stockDataTable.grantReadWriteData(this.stockDataAgent.lambda);

    // ==================== ORDER AGENT ====================
    this.orderAgent = new AgentConstruct(this, 'OrderAgent', {
      agentName: 'order-management',
      description: 'Manages stock orders via DSNE API',
      codePath: path.join(__dirname, '../../lambda/order-handler'),
      environment: commonEnv,
      memorySize: 256,
      timeout: 30,
      lambdaRole,
    });

    // Grant table access
    props.ordersTable.grantReadWriteData(this.orderAgent.lambda);

    // ==================== CHAT AGENT (Orchestrator) ====================
    this.chatAgent = new AgentConstruct(this, 'ChatAgent', {
      agentName: 'chat-orchestrator',
      description: 'Main chat orchestrator with Bedrock integration',
      codePath: path.join(__dirname, '../../lambda/chat-handler'),
      environment: {
        ...commonEnv,
        NEWS_AGENT_ARN: this.newsAnalysisAgent.lambda.functionArn,
        TECHNICAL_AGENT_ARN: this.technicalAnalysisAgent.lambda.functionArn,
        STOCK_DATA_AGENT_ARN: this.stockDataAgent.lambda.functionArn,
        ORDER_AGENT_ARN: this.orderAgent.lambda.functionArn,
      },
      memorySize: 512,
      timeout: 60,
      lambdaRole,
    });

    // Grant chat agent permissions to invoke other agents
    this.newsAnalysisAgent.lambda.grantInvoke(this.chatAgent.lambda);
    this.technicalAnalysisAgent.lambda.grantInvoke(this.chatAgent.lambda);
    this.stockDataAgent.lambda.grantInvoke(this.chatAgent.lambda);
    this.orderAgent.lambda.grantInvoke(this.chatAgent.lambda);

    // Grant chat agent access to all tables
    props.chatHistoryTable.grantReadWriteData(this.chatAgent.lambda);
    props.ordersTable.grantReadData(this.chatAgent.lambda);
    props.stockDataTable.grantReadData(this.chatAgent.lambda);
    props.newsTable.grantReadData(this.chatAgent.lambda);
    props.technicalReportsTable.grantReadData(this.chatAgent.lambda);
    props.analysisBucket.grantReadWrite(this.chatAgent.lambda);

    // Outputs
    new cdk.CfnOutput(this, 'ChatAgentArn', {
      value: this.chatAgent.lambda.functionArn,
      description: 'Chat Agent Lambda ARN',
    });

    new cdk.CfnOutput(this, 'NewsAgentSchedule', {
      value: 'Every 30 minutes',
      description: 'News Agent Execution Schedule',
    });

    new cdk.CfnOutput(this, 'TechnicalAgentSchedule', {
      value: 'Daily',
      description: 'Technical Analysis Agent Execution Schedule',
    });
  }
}
