import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as path from 'path';

export interface AgentConstructProps {
  /**
   * Name of the agent (e.g., 'news', 'technical-analysis', 'stock-data')
   */
  agentName: string;

  /**
   * Description of the agent
   */
  description: string;

  /**
   * Path to the Lambda function code
   */
  codePath: string;

  /**
   * Environment variables for the Lambda function
   */
  environment?: { [key: string]: string };

  /**
   * Memory size in MB (default: 512)
   */
  memorySize?: number;

  /**
   * Timeout in seconds (default: 60)
   */
  timeout?: number;

  /**
   * Whether to create a DynamoDB table for this agent
   */
  createTable?: boolean;

  /**
   * DynamoDB table configuration
   */
  tableConfig?: {
    partitionKey: string;
    sortKey?: string;
  };

  /**
   * Whether to create an SQS queue for async processing
   */
  createQueue?: boolean;

  /**
   * Whether to create a scheduled job
   */
  schedule?: {
    rate: cdk.Duration;
  };

  /**
   * IAM role for Lambda execution
   */
  lambdaRole?: iam.IRole;
}

/**
 * Reusable construct for creating an agent with Lambda, DynamoDB, SQS, and EventBridge
 */
export class AgentConstruct extends Construct {
  public readonly lambda: lambda.Function;
  public readonly table?: dynamodb.Table;
  public readonly queue?: sqs.Queue;
  public readonly deadLetterQueue?: sqs.Queue;
  public readonly rule?: events.Rule;

  constructor(scope: Construct, id: string, props: AgentConstructProps) {
    super(scope, id);

    // Create DynamoDB table if requested
    if (props.createTable) {
      const tableConfig = props.tableConfig || {
        partitionKey: 'id',
        sortKey: 'timestamp',
      };

      this.table = new dynamodb.Table(this, 'Table', {
        partitionKey: {
          name: tableConfig.partitionKey,
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: tableConfig.sortKey
          ? {
              name: tableConfig.sortKey,
              type: dynamodb.AttributeType.NUMBER,
            }
          : undefined,
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        pointInTimeRecovery: true,
      });
    }

    // Create SQS queues if requested
    if (props.createQueue) {
      // Dead letter queue
      this.deadLetterQueue = new sqs.Queue(this, 'DeadLetterQueue', {
        queueName: `${props.agentName}-dlq`,
        retentionPeriod: cdk.Duration.days(14),
      });

      // Main queue
      this.queue = new sqs.Queue(this, 'Queue', {
        queueName: `${props.agentName}-queue`,
        visibilityTimeout: cdk.Duration.seconds(props.timeout || 60),
        deadLetterQueue: {
          queue: this.deadLetterQueue,
          maxReceiveCount: 3,
        },
      });
    }

    // Prepare environment variables
    const environment = {
      ...(props.environment || {}),
      AGENT_NAME: props.agentName,
    };

    if (this.table) {
      environment.TABLE_NAME = this.table.tableName;
    }

    if (this.queue) {
      environment.QUEUE_URL = this.queue.queueUrl;
    }

    // Create Lambda function
    this.lambda = new lambda.Function(this, 'Function', {
      functionName: `${props.agentName}-handler`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(props.codePath),
      timeout: cdk.Duration.seconds(props.timeout || 60),
      memorySize: props.memorySize || 512,
      environment,
      role: props.lambdaRole,
      description: props.description,
    });

    // Grant permissions
    if (this.table) {
      this.table.grantReadWriteData(this.lambda);
    }

    if (this.queue) {
      this.queue.grantSendMessages(this.lambda);
      this.queue.grantConsumeMessages(this.lambda);
    }

    // Create scheduled rule if requested
    if (props.schedule) {
      this.rule = new events.Rule(this, 'ScheduleRule', {
        schedule: events.Schedule.rate(props.schedule.rate),
        description: `Scheduled execution for ${props.agentName}`,
      });

      this.rule.addTarget(
        new targets.LambdaFunction(this.lambda, {
          event: events.RuleTargetInput.fromObject({
            source: 'scheduled-event',
            agentName: props.agentName,
          }),
        })
      );
    }

    // Add SQS trigger if queue exists
    if (this.queue) {
      this.lambda.addEventSource(
        new lambda.EventSourceMapping(this, 'SqsEventSource', {
          eventSourceArn: this.queue.queueArn,
          batchSize: 10,
          maxBatchingWindow: cdk.Duration.seconds(5),
        })
      );
    }
  }

  /**
   * Grant this agent permission to invoke another agent
   */
  public grantInvoke(agent: AgentConstruct) {
    agent.lambda.grantInvoke(this.lambda);
  }

  /**
   * Grant this agent access to another agent's table
   */
  public grantTableAccess(agent: AgentConstruct, readOnly: boolean = false) {
    if (!agent.table) {
      throw new Error('Target agent does not have a table');
    }

    if (readOnly) {
      agent.table.grantReadData(this.lambda);
    } else {
      agent.table.grantReadWriteData(this.lambda);
    }
  }

  /**
   * Grant this agent permission to send messages to another agent's queue
   */
  public grantQueueSend(agent: AgentConstruct) {
    if (!agent.queue) {
      throw new Error('Target agent does not have a queue');
    }

    agent.queue.grantSendMessages(this.lambda);
  }
}
