import { ApolloClient, InMemoryCache } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

const apolloClient = new ApolloClient({
	link: createUploadLink({
		uri: 'https://localhost/graphql',
		credentials: 'include',
	}),
	cache: new InMemoryCache(),
});

export default apolloClient;
