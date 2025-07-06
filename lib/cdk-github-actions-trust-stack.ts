import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';

class EncryptionAspect implements cdk.IAspect {
  public visit(node: Construct): void {
    if (node instanceof s3.Bucket) {
      // Retrieve the underlying CloudFormation resource
      const cfnBucket = node.node.defaultChild as s3.CfnBucket;
      // Check if bucketEncryption is defined.
      if (!cfnBucket.bucketEncryption) {
        throw new Error(`Security violation: S3 Bucket "${node.node.id}" must have encryption enabled.`);
      }
    }
  }
}

export class CdkGithubActionsTrustStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    const queue = new sqs.Queue(this, 'CdkGithubActionsTrustQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    const insecureBucket = new s3.Bucket(this, 'InsecureBucket', {
      bucketName: 'insecure-bucket-demo'
    });

        cdk.Aspects.of(this).add(new EncryptionAspect());
  }
}
