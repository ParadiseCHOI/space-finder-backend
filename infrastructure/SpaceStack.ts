import { join } from 'path';

import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { GenericTable } from './GenericTable';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { handler } from '../services/node-lambda/hello';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';


export class SpaceStack extends Stack {

  private api = new RestApi(this, 'SpaceApi');
  private spacesTable = new GenericTable(
    'SpacesTable',
    'spaceId',
    this
  );

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // const helloLambda = new Function(this, 'helloLambda', {
    //   runtime: Runtime.NODEJS_14_X,
    //   code: Code.fromAsset(join(__dirname, '..', 'services', 'hello')),
    //   handler: 'hello.main'
    // });

    const helloLambdaNodejs = new NodejsFunction(this, 'helloLambdaNodejs', {
      entry: join(__dirname, '..', 'services', 'node-lambda', 'hello.ts'),
      handler: 'handler'
    });
    
    const s3ListPolicy = new PolicyStatement();
    s3ListPolicy.addActions("s3:ListAllMyBuckets");
    s3ListPolicy.addResources('*');
    helloLambdaNodejs.addToRolePolicy(s3ListPolicy);
    
    // Hello API lambda integration:(
    const helloLambdaIntegration = new LambdaIntegration(helloLambdaNodejs);
    const helloLambdaResource = this.api.root.addResource('hello');
    helloLambdaResource.addMethod('GET', helloLambdaIntegration);
  }
}