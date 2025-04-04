import { createContext, useContext } from 'react';
import { MutationFunctionOptions, OperationVariables, DefaultContext, ApolloCache, FetchResult } from '@apollo/client';
import { Space, useSpaceActions } from '../services/spaceActions';
import { Member, useMemberActions } from '../services/memberActions';
import { Category, useCategoryActions } from '../services/categoryActions';

// Type du contexte
interface SpaceContextType {
	spaces: Space[];
	setStatusFilter: React.Dispatch<React.SetStateAction<string | null>>;
	addSpace: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => Promise<FetchResult<any>>;
	updateSpace: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => Promise<FetchResult<any>>;
	deleteSpace: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => Promise<FetchResult<any>>;
	spaceLoading: boolean;
	members: Member[];
	addMember: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => Promise<FetchResult<any>>;
	updateMember: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => Promise<FetchResult<any>>;
	deleteMember: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => Promise<FetchResult<any>>;
	memberLoading: boolean;
	categories: Category[];
	addCategory: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => Promise<FetchResult<any>>;
	updateCategory: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => Promise<FetchResult<any>>;
	deleteCategory: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => Promise<FetchResult<any>>;
	categoryLoading: boolean;
}

// Création du contexte
const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

// Provider du contexte
export const SpaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { spaces, setStatusFilter, spaceLoading, addSpace, updateSpace, deleteSpace } = useSpaceActions();
	const { members, memberLoading, addMember, updateMember, deleteMember } = useMemberActions();
	const { categories, categoryLoading, addCategory, updateCategory, deleteCategory } = useCategoryActions();
	return (
		<SpaceContext.Provider
			value={{
				spaces,
				spaceLoading,
				setStatusFilter,
				addSpace,
				updateSpace,
				deleteSpace,
				members,
				memberLoading,
				addMember,
				updateMember,
				deleteMember,
				categories,
				categoryLoading,
				addCategory,
				updateCategory,
				deleteCategory,
			}}
		>
			{children}
		</SpaceContext.Provider>
	);
};

// Hook pour utiliser le contexte
export const useSpaces = (): SpaceContextType => {
	const context = useContext(SpaceContext);
	if (!context) {
		throw new Error("useSpaces doit être utilisé à l'intérieur d'un SpaceProvider");
	}
	return context;
};
