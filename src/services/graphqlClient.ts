import { GraphQLClient } from 'graphql-request';

const API_URL = 'http://localhost/api'; // Mets l'URL de ton API

export const graphqlClient = new GraphQLClient(API_URL);
