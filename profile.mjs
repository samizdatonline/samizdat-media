import AWS from 'aws-sdk';

export default async function Profile() {
    let name = process.env.PROFILE || 'PROD';
    try {
        let secretData = {}
        if (name !== 'LOCAL') {
            const client = new AWS.SecretsManager({region: "ca-central-1"});
            const secretName = "arn:aws:secretsmanager:ca-central-1:572229791409:secret:storj-UmHCMy";
            let result = await client.getSecretValue({SecretId: secretName}).promise();
            secretData = JSON.parse(result.SecretString);
        }
        return Object.assign(secretData,{PROFILE:name});
    } catch(e) {
        throw new Error('Error accessing secrets: '+e.code || e);
    }
}
