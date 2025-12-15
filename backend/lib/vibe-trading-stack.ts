import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as path from 'path';

export class VibeTradingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Tables
    const ordersTable = new dynamodb.Table(this, 'OrdersTable', {
      partitionKey: { name: 'orderId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const stockDataTable = new dynamodb.Table(this, 'StockDataTable', {
      partitionKey: { name: 'symbol', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const chatHistoryTable = new dynamodb.Table(this, 'ChatHistoryTable', {
      partitionKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // S3 Bucket for storing analysis results and reports
    const analysisBucket = new s3.Bucket(this, 'AnalysisBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // IAM Role for Lambda functions with Bedrock access
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Add Bedrock permissions
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream',
      ],
      resources: ['*'],
    }));

    // Lambda function environment variables
    const commonEnv = {
      ORDERS_TABLE_NAME: ordersTable.tableName,
      STOCK_DATA_TABLE_NAME: stockDataTable.tableName,
      CHAT_HISTORY_TABLE_NAME: chatHistoryTable.tableName,
      ANALYSIS_BUCKET_NAME: analysisBucket.bucketName,
    };

    // Chat Handler Lambda
    const chatHandler = new lambda.Function(this, 'ChatHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/chat-handler')),
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
      environment: commonEnv,
      role: lambdaRole,
    });

    // Stock Data Handler Lambda
    const stockDataHandler = new lambda.Function(this, 'StockDataHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/stock-data-handler')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: commonEnv,
      role: lambdaRole,
    });

    // Technical Analysis Lambda
    const technicalAnalysisHandler = new lambda.Function(this, 'TechnicalAnalysisHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/technical-analysis')),
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
      environment: commonEnv,
      role: lambdaRole,
    });

    // News Analysis Lambda
    const newsAnalysisHandler = new lambda.Function(this, 'NewsAnalysisHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/news-analysis')),
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
      environment: commonEnv,
      role: lambdaRole,
    });

    // Order Management Lambda
    const orderHandler = new lambda.Function(this, 'OrderHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/order-handler')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: commonEnv,
      role: lambdaRole,
    });

    // Grant DynamoDB permissions
    ordersTable.grantReadWriteData(chatHandler);
    ordersTable.grantReadWriteData(orderHandler);
    stockDataTable.grantReadWriteData(chatHandler);
    stockDataTable.grantReadWriteData(stockDataHandler);
    stockDataTable.grantReadWriteData(technicalAnalysisHandler);
    chatHistoryTable.grantReadWriteData(chatHandler);
    analysisBucket.grantReadWrite(chatHandler);
    analysisBucket.grantReadWrite(technicalAnalysisHandler);
    analysisBucket.grantReadWrite(newsAnalysisHandler);

    // API Gateway
    const api = new apigateway.RestApi(this, 'VibeTradingApi', {
      restApiName: 'Vibe Trading Service',
      description: 'API for Vietnam stock trading multi-agent system',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // API Routes
    const chat = api.root.addResource('chat');
    chat.addMethod('POST', new apigateway.LambdaIntegration(chatHandler));

    const stocks = api.root.addResource('stocks');
    stocks.addMethod('GET', new apigateway.LambdaIntegration(stockDataHandler));
    
    const stockDetail = stocks.addResource('{symbol}');
    stockDetail.addMethod('GET', new apigateway.LambdaIntegration(stockDataHandler));

    const analysis = api.root.addResource('analysis');
    const technicalAnalysis = analysis.addResource('technical');
    technicalAnalysis.addMethod('POST', new apigateway.LambdaIntegration(technicalAnalysisHandler));

    const newsAnalysis = analysis.addResource('news');
    newsAnalysis.addMethod('POST', new apigateway.LambdaIntegration(newsAnalysisHandler));

    const orders = api.root.addResource('orders');
    orders.addMethod('GET', new apigateway.LambdaIntegration(orderHandler));
    orders.addMethod('POST', new apigateway.LambdaIntegration(orderHandler));
    
    const orderDetail = orders.addResource('{orderId}');
    orderDetail.addMethod('GET', new apigateway.LambdaIntegration(orderHandler));
    orderDetail.addMethod('PUT', new apigateway.LambdaIntegration(orderHandler));
    orderDetail.addMethod('DELETE', new apigateway.LambdaIntegration(orderHandler));

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'OrdersTableName', {
      value: ordersTable.tableName,
      description: 'DynamoDB Orders Table Name',
    });

    new cdk.CfnOutput(this, 'StockDataTableName', {
      value: stockDataTable.tableName,
      description: 'DynamoDB Stock Data Table Name',
    });
  }
}
