import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export interface ApiStackProps extends cdk.NestedStackProps {
  /**
   * Lambda functions for API endpoints
   */
  chatHandler: lambda.IFunction;
  stockDataHandler: lambda.IFunction;
  technicalAnalysisHandler: lambda.IFunction;
  newsAnalysisHandler: lambda.IFunction;
  orderHandler: lambda.IFunction;
}

/**
 * Nested stack for API Gateway
 */
export class ApiStack extends cdk.NestedStack {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'VibeTradingApi', {
      restApiName: 'Vibe Trading Service',
      description: 'API for Vietnam stock trading multi-agent system',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
      deployOptions: {
        stageName: 'prod',
        throttlingBurstLimit: 1000,
        throttlingRateLimit: 500,
      },
    });

    // ==================== CHAT ROUTES ====================
    const chat = this.api.root.addResource('chat');
    chat.addMethod('POST', new apigateway.LambdaIntegration(props.chatHandler));

    // ==================== STOCK DATA ROUTES ====================
    const stocks = this.api.root.addResource('stocks');
    stocks.addMethod('GET', new apigateway.LambdaIntegration(props.stockDataHandler));

    const stockDetail = stocks.addResource('{symbol}');
    stockDetail.addMethod('GET', new apigateway.LambdaIntegration(props.stockDataHandler));

    // Market overview
    const market = stocks.addResource('market');
    const marketOverview = market.addResource('{exchange}');
    marketOverview.addMethod('GET', new apigateway.LambdaIntegration(props.stockDataHandler));

    // ==================== ANALYSIS ROUTES ====================
    const analysis = this.api.root.addResource('analysis');

    // Technical analysis
    const technicalAnalysis = analysis.addResource('technical');
    technicalAnalysis.addMethod('POST', new apigateway.LambdaIntegration(props.technicalAnalysisHandler));

    const technicalBySymbol = technicalAnalysis.addResource('{symbol}');
    technicalBySymbol.addMethod('GET', new apigateway.LambdaIntegration(props.technicalAnalysisHandler));

    // News analysis
    const newsAnalysis = analysis.addResource('news');
    newsAnalysis.addMethod('POST', new apigateway.LambdaIntegration(props.newsAnalysisHandler));
    newsAnalysis.addMethod('GET', new apigateway.LambdaIntegration(props.newsAnalysisHandler));

    const newsBySymbol = newsAnalysis.addResource('{symbol}');
    newsBySymbol.addMethod('GET', new apigateway.LambdaIntegration(props.newsAnalysisHandler));

    // ==================== ORDER ROUTES ====================
    const orders = this.api.root.addResource('orders');
    orders.addMethod('GET', new apigateway.LambdaIntegration(props.orderHandler));
    orders.addMethod('POST', new apigateway.LambdaIntegration(props.orderHandler));

    const orderDetail = orders.addResource('{orderId}');
    orderDetail.addMethod('GET', new apigateway.LambdaIntegration(props.orderHandler));
    orderDetail.addMethod('PUT', new apigateway.LambdaIntegration(props.orderHandler));
    orderDetail.addMethod('DELETE', new apigateway.LambdaIntegration(props.orderHandler));

    // Portfolio
    const portfolio = orders.addResource('portfolio');
    portfolio.addMethod('GET', new apigateway.LambdaIntegration(props.orderHandler));

    // ==================== HEALTH CHECK ====================
    const health = this.api.root.addResource('health');
    health.addMethod(
      'GET',
      new apigateway.MockIntegration({
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': '{"status": "healthy", "timestamp": "$context.requestTime"}',
            },
          },
        ],
        requestTemplates: {
          'application/json': '{"statusCode": 200}',
        },
      }),
      {
        methodResponses: [{ statusCode: '200' }],
      }
    );

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'API Gateway URL',
      exportName: 'VibeTradingApiUrl',
    });

    new cdk.CfnOutput(this, 'ApiId', {
      value: this.api.restApiId,
      description: 'API Gateway ID',
    });
  }
}
