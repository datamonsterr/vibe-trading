import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DatabaseStack } from './stacks/database-stack';
import { AgentsStack } from './stacks/agents-stack';
import { ApiStack } from './stacks/api-stack';

export class VibeTradingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ==================== DATABASE STACK ====================
    const databaseStack = new DatabaseStack(this, 'DatabaseStack', {
      namePrefix: 'VibeTrad',
    });

    // ==================== AGENTS STACK ====================
    const agentsStack = new AgentsStack(this, 'AgentsStack', {
      ordersTable: databaseStack.ordersTable,
      stockDataTable: databaseStack.stockDataTable,
      chatHistoryTable: databaseStack.chatHistoryTable,
      newsTable: databaseStack.newsTable,
      technicalReportsTable: databaseStack.technicalReportsTable,
      analysisBucket: databaseStack.analysisBucket,
    });

    // ==================== API STACK ====================
    const apiStack = new ApiStack(this, 'ApiStack', {
      chatHandler: agentsStack.chatAgent.lambda,
      stockDataHandler: agentsStack.stockDataAgent.lambda,
      technicalAnalysisHandler: agentsStack.technicalAnalysisAgent.lambda,
      newsAnalysisHandler: agentsStack.newsAnalysisAgent.lambda,
      orderHandler: agentsStack.orderAgent.lambda,
    });

    // ==================== STACK OUTPUTS ====================
    new cdk.CfnOutput(this, 'DatabaseStackName', {
      value: databaseStack.stackName,
      description: 'Database Stack Name',
    });

    new cdk.CfnOutput(this, 'AgentsStackName', {
      value: agentsStack.stackName,
      description: 'Agents Stack Name',
    });

    new cdk.CfnOutput(this, 'ApiStackName', {
      value: apiStack.stackName,
      description: 'API Stack Name',
    });
  }
}
