import AWS from 'aws-sdk';
import axios from 'axios';

const cloudformation = new AWS.CloudFormation({
  apiVersion: '2010-05-15',
  region: 'eu-north-1',
});

const apiEndpoint = (stackName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudformation.describeStacks({ StackName: stackName }, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data.Stacks[0].Outputs.filter((output) => output.OutputKey === 'ServiceEndpoint')[0].OutputValue);
      }
    });
  });
};

const postHello = (endpoint: string) =>
  axios.post(`${endpoint}/hello`, { name: 'Test' }).then((response) => response.data);

describe('test', () => {
  it('should test e2e', () => {
    return apiEndpoint(process.env.STACK).then((endpoint) => {
      return postHello(endpoint).then((response) => {
        expect(response.message).toEqual('Hello Test, welcome to the exciting Serverless world!');
      });
    });
  });
});
