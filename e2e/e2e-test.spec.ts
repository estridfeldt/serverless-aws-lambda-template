import AWS from 'aws-sdk';
import axios from 'axios';

const region = 'eu-north-1';

const cloudformation = new AWS.CloudFormation({
  apiVersion: '2010-05-15',
  region,
});

const apiEndpoint = (stackName: string): Promise<string> =>
  cloudformation
    .describeStacks({ StackName: stackName })
    .promise()
    .then((data) =>
      data.Stacks.length === 1 ? data.Stacks[0] : Promise.reject(new Error(`No such stack ${stackName}`)),
    )
    .then((stack) => stack.Outputs.filter((output) => output.OutputKey === 'ServiceEndpoint'))
    .then((serviceEndpoints) =>
      serviceEndpoints.length === 1 ? serviceEndpoints[0] : Promise.reject(new Error('No serviceEndpoint')),
    )
    .then((serviceEndpoint) => serviceEndpoint.OutputValue);

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
