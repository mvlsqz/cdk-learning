import { Duration, Stack, StackProps, CfnOutput } from 'aws-cdk-lib'
import { Bucket, CfnBucket } from 'aws-cdk-lib/aws-s3'
import { KeyPair } from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs'

class L3Bucket extends Construct {
  constructor(scope: Construct, id: string, days: number) {
    super(scope, id);
    new Bucket(this, 'MyL3Bucket', {
      lifecycleRules: [{
        expiration: Duration.days(days)
      }]
    })
  }
}


export class FundationsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new KeyPair(this, 'MyKeyPair', {
      keyPairName: "kube-demo"
    })

    new CfnBucket(this, 'MyL1Bucket', {
      lifecycleConfiguration: {
        rules: [{
          expirationInDays: 1,
          status: 'Enabled',
        }]
      }
    })

    new Bucket(this, 'MyFirstBucket', {
      lifecycleRules: [
        {
          expiration: Duration.days(2)
        }
      ]
    })

    new L3Bucket(this, 'MyL3Bucket', 5);

    const MyL1Bucket = new Bucket(this, 'MyL2Bucket', {
      lifecycleRules: [{
        expiration: Duration.days(2)
      }]
    })

    console.log("Bucket name: " + MyL1Bucket.bucketName);

    new CfnOutput(this, 'BucketNameOutput', {
      value: MyL1Bucket.bucketName
    })
  }
}
