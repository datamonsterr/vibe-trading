import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface DatabaseStackProps extends cdk.NestedStackProps {
  /**
   * Prefix for resource names
   */
  namePrefix?: string;
}

/**
 * Nested stack for all database resources
 */
export class DatabaseStack extends cdk.NestedStack {
  public readonly ordersTable: dynamodb.Table;
  public readonly stockDataTable: dynamodb.Table;
  public readonly chatHistoryTable: dynamodb.Table;
  public readonly newsTable: dynamodb.Table;
  public readonly technicalReportsTable: dynamodb.Table;
  public readonly analysisBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: DatabaseStackProps) {
    super(scope, id, props);

    const prefix = props?.namePrefix || '';

    // Orders Table
    this.ordersTable = new dynamodb.Table(this, 'OrdersTable', {
      tableName: `${prefix}Orders`,
      partitionKey: { name: 'orderId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    // Add GSI for querying by status
    this.ordersTable.addGlobalSecondaryIndex({
      indexName: 'StatusIndex',
      partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
    });

    // Stock Data Table
    this.stockDataTable = new dynamodb.Table(this, 'StockDataTable', {
      tableName: `${prefix}StockData`,
      partitionKey: { name: 'symbol', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
      timeToLiveAttribute: 'ttl',  // Auto-delete old data
    });

    // Chat History Table
    this.chatHistoryTable = new dynamodb.Table(this, 'ChatHistoryTable', {
      tableName: `${prefix}ChatHistory`,
      partitionKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
      timeToLiveAttribute: 'ttl',
    });

    // News Table (for cached news and embeddings)
    this.newsTable = new dynamodb.Table(this, 'NewsTable', {
      tableName: `${prefix}News`,
      partitionKey: { name: 'newsId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
      timeToLiveAttribute: 'ttl',
    });

    // Add GSI for querying by symbol
    this.newsTable.addGlobalSecondaryIndex({
      indexName: 'SymbolIndex',
      partitionKey: { name: 'symbol', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
    });

    // Add GSI for querying by source
    this.newsTable.addGlobalSecondaryIndex({
      indexName: 'SourceIndex',
      partitionKey: { name: 'source', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
    });

    // Technical Reports Table
    this.technicalReportsTable = new dynamodb.Table(this, 'TechnicalReportsTable', {
      tableName: `${prefix}TechnicalReports`,
      partitionKey: { name: 'symbol', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'reportDate', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
      timeToLiveAttribute: 'ttl',
    });

    // Add GSI for querying by source
    this.technicalReportsTable.addGlobalSecondaryIndex({
      indexName: 'SourceIndex',
      partitionKey: { name: 'source', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'reportDate', type: dynamodb.AttributeType.STRING },
    });

    // S3 Bucket for analysis results and reports
    this.analysisBucket = new s3.Bucket(this, 'AnalysisBucket', {
      bucketName: `${prefix.toLowerCase()}analysis-results`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(30),
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(7),
            },
          ],
        },
      ],
    });

    // Outputs
    new cdk.CfnOutput(this, 'OrdersTableName', {
      value: this.ordersTable.tableName,
      description: 'DynamoDB Orders Table Name',
    });

    new cdk.CfnOutput(this, 'NewsTableName', {
      value: this.newsTable.tableName,
      description: 'DynamoDB News Table Name',
    });

    new cdk.CfnOutput(this, 'TechnicalReportsTableName', {
      value: this.technicalReportsTable.tableName,
      description: 'DynamoDB Technical Reports Table Name',
    });
  }
}
