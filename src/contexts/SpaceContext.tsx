import { createContext, useState, useContext, useEffect } from 'react';
import { useMutation, MutationFunctionOptions, OperationVariables, DefaultContext, ApolloCache, FetchResult, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAlerts } from './AlertContext';

// Définition du type Space
export interface Space {
	id: string;
	name: string;
	professional: boolean;
	color?: string | null;
	icon?: string | null;
	personalizedIconUrl?: string | null;
	parent?: Space | null;
	status: 'open' | 'archived';
}

// Type du contexte
interface SpaceContextType {
	spaces: Space[];
	setStatusFilter: React.Dispatch<React.SetStateAction<string | null>>;
	addSpace: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => Promise<FetchResult<any>>;
	updateSpace: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => Promise<FetchResult<any>>;
	deleteSpace: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => Promise<FetchResult<any>>;
	loading: boolean;
}

// Création du contexte
const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

// Provider du contexte
export const SpaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [spaces, setSpaces] = useState<Space[]>([]);
	const [statusFilter, setStatusFilter] = useState<string | null>('open');
	const [loading, setLoading] = useState<boolean>(false);
	const { showAlert } = useAlerts();

	const SPACE_FIELDS = gql`
		fragment SpaceFields on Space {
			id
			name
			professional
			color
			icon
			personalizedIconUrl
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
	const {
		data: spacesData,
		loading: spacesLoading,
		error: spacesError,
		refetch,
	} = useQuery(GET_SPACES, {
		variables: { status: statusFilter },
		fetchPolicy: 'network-only',
	});
	useEffect(() => {
		if (spacesLoading) {
			setLoading(true);
		}
		if (spacesData || spacesError) {
			setLoading(false);
		}
		if (spacesData) {
			setSpaces(spacesData.spaces.edges.map((edge: { node: Space }) => edge.node));
		}
		if (spacesError) {
			showAlert({ severity: 'error', message: 'Une erreur est survenue lors de la récupération des espaces.', date: Date.now().toString() });
			console.error(spacesError);
		}
	}, [statusFilter, spacesLoading, spacesData, spacesError]);

	// Ajouter un espace
	const ADD_SPACE = gql`
		mutation CreateSpace($name: String!, $status: String!, $professional: Boolean!, $color: String, $icon: String, $personalizedIconFile: Upload, $parent: String) {
			createSpace(
				input: { name: $name, status: $status, professional: $professional, color: $color, icon: $icon, personalizedIconFile: $personalizedIconFile, parent: $parent }
			) {
				space {
					...SpaceFields
				}
			}
		}
		${SPACE_FIELDS}
	`;
	const [addSpace, { data: addSpaceData, loading: addSpaceLoaging, error: addSpaceError }] = useMutation(ADD_SPACE, {
		onCompleted: () => {
			refetch(); // Refait la requête après la mutation
		},
	});
	useEffect(() => {
		if (addSpaceLoaging) {
			setLoading(true);
		}
		if (addSpaceData || addSpaceError) {
			setLoading(false);
		}
		if (addSpaceData) {
			showAlert({ severity: 'success', message: "L'espace a bien été ajouté.", date: Date.now().toString() });
		}
		if (addSpaceError) {
			showAlert({ severity: 'error', message: "Une erreur est survenue lors de l'ajout de l'espace.", date: Date.now().toString() });
		}
	}, [addSpaceLoaging, addSpaceData, addSpaceError]);

	// Modifier un espace
	const UPDATE_SPACE = gql`
		mutation UpdateSpace($id: ID!, $name: String, $status: String, $professional: Boolean, $color: String, $icon: String, $personalizedIconFile: Upload, $parent: String) {
			updateSpace(
				input: {
					id: $id
					name: $name
					status: $status
					professional: $professional
					color: $color
					icon: $icon
					personalizedIconFile: $personalizedIconFile
					parent: $parent
				}
			) {
				space {
					...SpaceFields
				}
			}
		}
		${SPACE_FIELDS}
	`;
	const [updateSpace, { data: updateSpaceData, loading: updateSpaceLoaging, error: updateSpaceError }] = useMutation(UPDATE_SPACE, {
		onCompleted: () => {
			refetch(); // Refait la requête après la mutation
		},
	});
	useEffect(() => {
		if (updateSpaceLoaging) {
			setLoading(true);
		}
		if (updateSpaceData || updateSpaceError) {
			setLoading(false);
		}
	}, [updateSpaceLoaging, updateSpaceData, updateSpaceError]);

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
	const [deleteSpace, { data: deleteSpaceData, loading: deleteSpaceLoaging, error: deleteSpaceError }] = useMutation(DELETE_SPACE, {
		refetchQueries: [GET_SPACES, 'GetSpaces'],
	});
	useEffect(() => {
		if (deleteSpaceLoaging) {
			setLoading(true);
		}
		if (deleteSpaceData || deleteSpaceError) {
			setLoading(false);
		}
		if (deleteSpaceData) {
			showAlert({ severity: 'success', message: "L'espace a bien été supprimé.", date: Date.now().toString() });
		}
		if (deleteSpaceError) {
			showAlert({ severity: 'error', message: "Une erreur est survenue lors de la suppression de l'espace.", date: Date.now().toString() });
		}
	}, [deleteSpaceLoaging, deleteSpaceData, deleteSpaceError]);

	return <SpaceContext.Provider value={{ spaces, setStatusFilter, addSpace, updateSpace, deleteSpace, loading }}>{children}</SpaceContext.Provider>;
};

// Hook pour utiliser le contexte
export const useSpaces = (): SpaceContextType => {
	const context = useContext(SpaceContext);
	if (!context) {
		throw new Error("useSpaces doit être utilisé à l'intérieur d'un SpaceProvider");
	}
	return context;
};
