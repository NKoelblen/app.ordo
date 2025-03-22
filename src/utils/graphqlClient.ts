import { GraphQLClient } from 'graphql-request';

const graphqlClient = new GraphQLClient('http://localhost/api/graphql', {
	headers: {
		'Content-Type': 'application/json',
	},
});

export default graphqlClient;
