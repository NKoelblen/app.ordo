import { createContext, useState, useContext, useEffect } from 'react';
import graphqlClient from '../services/graphqlClient';
import { gql } from 'graphql-request';

// Définition du type Space
export interface Space {
	id: string;
	name: string;
	status: 'open' | 'archived';
	professional: boolean;
	parent?: Space | null;
}

// Type du contexte
interface SpaceContextType {
	spaces: Space[];
	setStatusFilter: React.Dispatch<React.SetStateAction<string | null>>;
	addSpace: (newSpace: Omit<Space, 'id'>) => Promise<void>;
	updateName: (id: string, name: string) => Promise<void>;
	updateProfessional: (id: string, professional: boolean) => Promise<void>;
	updateStatus: (id: string, status: 'open' | 'archived') => Promise<void>;
	updateParent: (id: string, parent: string | null) => Promise<void>;
	deleteSpace: (id: string) => Promise<void>;
}

// Création du contexte
const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

// Provider du contexte
export const SpaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [spaces, setSpaces] = useState<Space[]>([]);
	const [statusFilter, setStatusFilter] = useState<string | null>('open');

	const SPACE_FIELDS = gql`
		fragment SpaceFields on Space {
			id
			name
			professional
			status
			parent {
				id
				name
				professional
				status
			}
		}
	`;

	// Récupérer les espaces
	const GETS = gql`
		query GetSpaces($status: String) {
			spaces(status: $status) {
				edges {
					node {
						...SpaceFields
					}
				}
			}
		}
		${SPACE_FIELDS}
	`;
	useEffect(() => {
		const fetchSpaces = async () => {
			try {
				const variables = { status: statusFilter };
				const data = await graphqlClient.request<{ spaces: { edges: { node: Space }[] } }>(GETS, variables);
				const spaces = data.spaces.edges.map((edge) => edge.node);
				setSpaces(spaces);
			} catch (error) {
				console.error('Erreur lors de la récupération des espaces:', error);
			}
		};

		fetchSpaces();
	}, [statusFilter]);

	// Ajouter un espace
	const ADD_SPACE = gql`
		mutation CreateSpace($name: String!, $status: String!, $professional: Boolean!, $parent: String) {
			createSpace(input: { name: $name, status: $status, professional: $professional, parent: $parent }) {
				space {
					...SpaceFields
				}
			}
		}
		${SPACE_FIELDS}
	`;

	const addSpace = async (newSpace: Omit<Space, 'id'>) => {
		try {
			const variables = {
				name: newSpace.name,
				status: newSpace.status,
				professional: newSpace.professional,
				parent: newSpace.parent,
			};
			const data = await graphqlClient.request<{ createSpace: { space: Space } }>(ADD_SPACE, variables);
			setSpaces((prevSpaces) => [...prevSpaces, data.createSpace.space]);
		} catch (error: any) {
			console.log(`Erreur : ${error.message}`);
		}
	};

	// Renommer un espace
	const UPDATE_NAME = gql`
		mutation UpdateSpace($id: ID!, $name: String!) {
			updateSpace(input: { id: $id, name: $name }) {
				space {
					id
					name
					status
				}
			}
		}
	`;
	const updateName = async (spaceId: string, spaceName: string) => {
		try {
			const variables = {
				id: spaceId,
				name: spaceName,
			};
			const data = await graphqlClient.request<{ updateSpace: { space: Space } }>(UPDATE_NAME, variables);
			setSpaces((prevSpaces) => prevSpaces.map((space) => (space.id === data.updateSpace.space.id ? data.updateSpace.space : space)));
		} catch (error: any) {
			console.log(`Erreur : ${error.message}`);
		}
	};

	// Modifier la propriété professional d'un espace
	const UPDATE_PROFESSIONAL = gql`
		mutation UpdateSpace($id: ID!, $professional: Boolean!) {
			updateSpace(input: { id: $id, professional: $professional }) {
				space {
					id
					professional
				}
			}
		}
	`;
	const updateProfessional = async (spaceId: string, spaceProfessional: boolean) => {
		try {
			const variables = {
				id: spaceId,
				professional: spaceProfessional,
			};
			const data = await graphqlClient.request<{ updateSpace: { space: Space } }>(UPDATE_PROFESSIONAL, variables);

			// Récupère tous les descendants de l'espace mis à jour
			const descendants = getDescendants(data.updateSpace.space, spaces);

			// Met à jour l'état global
			setSpaces((prevSpaces) =>
				prevSpaces.map((space) => {
					// Met à jour l'espace cible ou ses descendants
					if (space.id === spaceId || descendants.some((descendant) => descendant.id === space.id)) {
						return {
							...space,
							professional: spaceProfessional,
						};
					}
					return space;
				})
			);
		} catch (error: any) {
			console.log(`Erreur : ${error.message}`);
		}
	};

	// Modifier le statut un espace
	const UPDATE_STATUS = gql`
		mutation UpdateSpace($id: ID!, $status: String!) {
			updateSpace(input: { id: $id, status: $status }) {
				space {
					...SpaceFields
				}
			}
		}
		${SPACE_FIELDS}
	`;
	const updateStatus = async (spaceId: string, spaceStatus: 'open' | 'archived') => {
		try {
			const variables = {
				id: spaceId,
				status: spaceStatus,
			};
			const data = await graphqlClient.request<{ updateSpace: { space: Space } }>(UPDATE_STATUS, variables);

			// Récupère tous les descendants de l'espace mis à jour
			const descendants = getDescendants(data.updateSpace.space, spaces);

			// Met à jour l'état global
			setSpaces((prevSpaces) =>
				prevSpaces.map((space) => {
					// Met à jour l'espace cible ou ses descendants
					if (space.id === spaceId || descendants.some((descendant) => descendant.id === space.id)) {
						return {
							...space,
							status: spaceStatus,
						};
					}
					return space;
				})
			);
		} catch (error: any) {
			console.log(`Erreur : ${error.message}`);
		}
	};

	// Renommer un espace
	const UPDATE_PARENT = gql`
		mutation UpdateSpace($id: ID!, $parent: ID) {
			updateSpace(input: { id: $id, parent: $parent }) {
				space {
					id
					parent {
						id
					}
				}
			}
		}
	`;
	const updateParent = async (spaceId: string, newParentId: string | null) => {
		try {
			const variables = {
				id: spaceId,
				parent: newParentId,
			};
			await graphqlClient.request<{ updateSpace: { space: Space } }>(UPDATE_PARENT, variables);
		} catch (error: any) {
			console.log(`Erreur : ${error.message}`);
		}
	};

	// Supprimer un espace
	const DELETE_SPACE = gql`
		mutation deleteSpace($id: ID!) {
			deleteSpace(input: { id: $id }) {
				space {
					id
				}
			}
		}
	`;
	const deleteSpace = async (spaceId: string) => {
		try {
			const variables = { id: spaceId };
			await graphqlClient.request(DELETE_SPACE, variables);
			setSpaces((prevSpaces) => prevSpaces.filter((space) => space.id !== spaceId));
		} catch (error) {
			console.error('Erreur:', error);
		}
	};

	// Fonction pour récupérer tous les descendants d'un espace
	const getDescendants = (space: Space, allSpaces: Space[]): Space[] => {
		let descendants: Space[] = [];

		allSpaces.forEach((currentSpace) => {
			if (currentSpace.parent?.id === space.id) {
				descendants.push(currentSpace);
				descendants = descendants.concat(getDescendants(currentSpace, allSpaces));
			}
		});

		return descendants;
	};

	return (
		<SpaceContext.Provider value={{ spaces, setStatusFilter, addSpace, deleteSpace, updateName, updateProfessional, updateStatus, updateParent }}>
			{children}
		</SpaceContext.Provider>
	);
};

// Hook personnalisé pour utiliser le contexte
export const useSpaces = (): SpaceContextType => {
	const context = useContext(SpaceContext);
	if (!context) {
		throw new Error("useSpaces doit être utilisé à l'intérieur d'un SpaceProvider");
	}
	return context;
};
