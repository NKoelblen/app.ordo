import { createContext, useState, useContext, useEffect } from 'react';
import graphqlClient from '../utils/graphqlClient';
import { gql } from 'graphql-request';

// Définition du type Space
export interface Space {
	id: string;
	name: string;
	status: 'open' | 'archived';
	professional: boolean;
	parent?: number | null;
	children?: { edges: { node: Space }[] };
}

// Type du contexte
interface SpaceContextType {
	spaces: Space[];
	addSpace: (newSpace: Omit<Space, 'id'>) => Promise<void>;
	updateSpaceName: (id: string, name: string) => Promise<void>;
	updateSpaceProfessional: (id: string, professional: boolean) => Promise<void>;
	updateSpaceStatus: (id: string, status: 'open' | 'archived') => Promise<void>;
	deleteSpace: (id: string) => Promise<void>;
	setStatusFilter: React.Dispatch<React.SetStateAction<string | null>>;
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
			children {
				edges {
					node {
						id
						name
						professional
						status
					}
				}
			}
		}
	`;

	// Récupérer les espaces
	const GET_SPACES = gql`
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
				const data = await graphqlClient.request<{ spaces: { edges: { node: Space }[] } }>(GET_SPACES, variables);
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
	const UPDATE_SPACE_NAME = gql`
		mutation UpdateSpace($id: ID!, $name: String!) {
			updateSpace(input: { id: $id, name: $name }) {
				space {
					id
					name
				}
			}
		}
	`;
	const updateSpaceName = async (spaceId: string, spaceName: string) => {
		try {
			const variables = {
				id: spaceId,
				name: spaceName,
			};
			const data = await graphqlClient.request<{ updateSpace: { space: Space } }>(UPDATE_SPACE_NAME, variables);
			setSpaces((prevSpaces) => prevSpaces.map((space) => (space.id === data.updateSpace.space.id ? data.updateSpace.space : space)));
		} catch (error: any) {
			console.log(`Erreur : ${error.message}`);
		}
	};

	// Modifier la propriété professional d'un espace
	const UPDATE_SPACE_PROFESSIONAL = gql`
		mutation UpdateSpace($id: ID!, $professional: Boolean!) {
			updateSpace(input: { id: $id, professional: $professional }) {
				space {
					id
					professional
					children {
						edges {
							node {
								id
								name
								professional
								status
							}
						}
					}
				}
			}
		}
	`;
	const updateSpaceProfessional = async (spaceId: string, spaceProfessional: boolean) => {
		try {
			const variables = {
				id: spaceId,
				professional: spaceProfessional,
			};
			const data = await graphqlClient.request<{ updateSpace: { space: Space } }>(UPDATE_SPACE_PROFESSIONAL, variables);

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
	const UPDATE_SPACE_STATUS = gql`
		mutation UpdateSpace($id: ID!, $status: String!) {
			updateSpace(input: { id: $id, status: $status }) {
				space {
					...SpaceFields
				}
			}
		}
		${SPACE_FIELDS}
	`;
	const updateSpaceStatus = async (spaceId: string, spaceStatus: 'open' | 'archived') => {
		try {
			const variables = {
				id: spaceId,
				status: spaceStatus,
			};
			const data = await graphqlClient.request<{ updateSpace: { space: Space } }>(UPDATE_SPACE_STATUS, variables);

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

	// Supprimer un espace
	const DELETE_SPACE = gql`
		mutation DeleteSpace($id: ID!) {
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

		// Parcourt les enfants de l'espace actuel
		space.children?.edges.forEach((child) => {
			// Ajoute l'enfant actuel à la liste des descendants
			descendants.push(child.node);

			// Recherche l'espace correspondant dans la liste globale
			const matchingSpace = allSpaces.find((s) => s.id === child.node.id);

			// Si un espace correspondant est trouvé, récupère récursivement ses descendants
			if (matchingSpace) {
				descendants = descendants.concat(getDescendants(matchingSpace, allSpaces));
			}
		});

		return descendants;
	};

	return (
		<SpaceContext.Provider value={{ spaces, addSpace, deleteSpace, updateSpaceName, updateSpaceProfessional, updateSpaceStatus, setStatusFilter }}>
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
