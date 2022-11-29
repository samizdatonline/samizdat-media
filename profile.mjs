import AWS from 'aws-sdk';

export default async function Profile() {
    try {
        let secretData = {}
        const givenEnvironment = (process.env.PROFILE || 'production').toLowerCase();
        const client = new AWS.SecretsManager({region: "ca-central-1"});
        const secretName = "arn:aws:secretsmanager:ca-central-1:572229791409:secret:storj-UmHCMy";
        let result = await client.getSecretValue({SecretId: secretName}).promise();
        secretData = JSON.parse(result.SecretString);
        // declare keys for each profile
        let keys = {
            production:{
                name:'production',
                server:'https://admin.samizdat.online'
            },
            development:{
                name:'development',
                server:'https://devadmin.samizdat.online'
            },
            local:{
                name:'local',
                server:'http://localhost:3000'
            },
        };
        return Object.assign({STORJ:secretData},keys[givenEnvironment]);
    } catch(e) {
        throw new Error('Error accessing secrets: '+e.code || e);
    }
}
