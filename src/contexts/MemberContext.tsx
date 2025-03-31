import { createContext, useState, useContext, useEffect } from 'react';
import { useMutation, MutationFunctionOptions, OperationVariables, DefaultContext, ApolloCache, FetchResult, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAlerts } from './AlertContext';
import { Space } from './SpaceContext';

// Définition du type Space
export interface Member {
	id: string;
	name: string;
	color?: string | null;
	icon?: string | null;
	personalizedIconUrl?: string | null;
	space?: Space | null;
}

// Type du contexte
interface MemberContextType {
	members: Member[];
	addMember: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => Promise<FetchResult<any>>;
	updateMember: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => Promise<FetchResult<any>>;
	deleteMember: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => Promise<FetchResult<any>>;
	loading: boolean;
}

// Création du contexte
const MemberContext = createContext<MemberContextType | undefined>(undefined);

// Provider du contexte
export const MemberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [members, setMembers] = useState<Member[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const { showAlert } = useAlerts();

	const MEMBER_FIELDS = gql`
		fragment MemberFields on Member {
			id
			name
			color
			icon
			personalizedIconUrl
			space {
				id
			}
		}
	`;

	// Récupérer les membres
	const GET_MEMBERS = gql`
		query {
			members {
				edges {
					node {
						...MemberFields
					}
				}
			}
		}
		${MEMBER_FIELDS}
	`;
	const {
		data: membersData,
		loading: membersLoading,
		error: membersError,
		refetch,
	} = useQuery(GET_MEMBERS, {
		fetchPolicy: 'network-only',
	});
	useEffect(() => {
		if (membersLoading) {
			setLoading(true);
		}
		if (membersData || membersError) {
			setLoading(false);
		}
		if (membersData) {
			setMembers(membersData.members.edges.map((edge: { node: Member }) => edge.node));
		}
		if (membersError) {
			showAlert({ severity: 'error', message: 'Une erreur est survenue lors de la récupération des membres.', date: Date.now().toString() });
			console.error(membersError);
		}
	}, [membersLoading, membersData, membersError]);

	// Ajouter un membre
	const ADD_MEMBER = gql`
		mutation CreateMember($name: String!, $color: String, $icon: String, $personalizedIconFile: Upload, $space: String) {
			createMember(input: { name: $name, color: $color, icon: $icon, personalizedIconFile: $personalizedIconFile, space: $space }) {
				member {
					...MemberFields
				}
			}
		}
		${MEMBER_FIELDS}
	`;
	const [addMember, { data: addMemberData, loading: addMemberLoaging, error: addMemberError }] = useMutation(ADD_MEMBER, {
		onCompleted: () => {
			refetch(); // Refait la requête après la mutation
		},
	});
	useEffect(() => {
		if (addMemberLoaging) {
			setLoading(true);
		}
		if (addMemberData || addMemberError) {
			setLoading(false);
		}
		if (addMemberData) {
			showAlert({ severity: 'success', message: 'Le membre a bien été ajouté.', date: Date.now().toString() });
		}
		if (addMemberError) {
			showAlert({ severity: 'error', message: "Une erreur est survenue lors de l'ajout du membre.", date: Date.now().toString() });
		}
	}, [addMemberLoaging, addMemberData, addMemberError]);

	// Modifier un membre
	const UPDATE_MEMBER = gql`
		mutation UpdateMember($id: ID!, $name: String, $color: String, $icon: String, $personalizedIconFile: Upload, $space: String) {
			updateMember(input: { id: $id, name: $name, color: $color, icon: $icon, personalizedIconFile: $personalizedIconFile, space: $space }) {
				member {
					...MemberFields
				}
			}
		}
		${MEMBER_FIELDS}
	`;
	const [updateMember, { data: updateMemberData, loading: updateMemberLoaging, error: updateMemberError }] = useMutation(UPDATE_MEMBER, {
		onCompleted: () => {
			refetch(); // Refait la requête après la mutation
		},
	});
	useEffect(() => {
		if (updateMemberLoaging) {
			setLoading(true);
		}
		if (updateMemberData || updateMemberError) {
			setLoading(false);
		}
	}, [updateMemberLoaging, updateMemberData, updateMemberError]);

	// Supprimer un membre
	const DELETE_MEMBER = gql`
		mutation deleteMember($id: ID!) {
			deleteMember(input: { id: $id }) {
				member {
					id
				}
			}
		}
	`;
	const [deleteMember, { data: deleteMemberData, loading: deleteMemberLoaging, error: deleteMemberError }] = useMutation(DELETE_MEMBER, {
		refetchQueries: [GET_MEMBERS, 'GetMembers'],
	});
	useEffect(() => {
		if (deleteMemberLoaging) {
			setLoading(true);
		}
		if (deleteMemberData || deleteMemberError) {
			setLoading(false);
		}
		if (deleteMemberData) {
			showAlert({ severity: 'success', message: 'Le membre a bien été supprimé.', date: Date.now().toString() });
		}
		if (deleteMemberError) {
			showAlert({ severity: 'error', message: 'Une erreur est survenue lors de la suppression du membre.', date: Date.now().toString() });
		}
	}, [deleteMemberLoaging, deleteMemberData, deleteMemberError]);

	return <MemberContext.Provider value={{ members, addMember, updateMember, deleteMember, loading }}>{children}</MemberContext.Provider>;
};

// Hook pour utiliser le contexte
export const useMembers = (): MemberContextType => {
	const context = useContext(MemberContext);
	if (!context) {
		throw new Error("useMembers doit être utilisé à l'intérieur d'un MemberProvider");
	}
	return context;
};
