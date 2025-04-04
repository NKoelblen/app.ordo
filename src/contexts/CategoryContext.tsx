import { createContext, useState, useContext, useEffect } from 'react';
import { useMutation, MutationFunctionOptions, OperationVariables, DefaultContext, ApolloCache, FetchResult, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAlerts } from './AlertContext';
import { Space } from './SpaceContext';

// Définition du type Space
export interface Category {
	id: string;
	name: string;
	color?: string | null;
	icon?: string | null;
	personalizedIconUrl?: string | null;
	space?: Space | null;
	parent?: Category | null;
}

// Type du contexte
interface CategoryContextType {
	categories: Category[];
	addCategory: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => Promise<FetchResult<any>>;
	updateCategory: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => Promise<FetchResult<any>>;
	deleteCategory: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => Promise<FetchResult<any>>;
	loading: boolean;
}

// Création du contexte
const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

// Provider du contexte
export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const { showAlert } = useAlerts();

	const CATEGORY_FIELDS = gql`
		fragment CategoryFields on Category {
			id
			name
			color
			icon
			personalizedIconUrl
			space {
				id
			}
			parent {
				id
			}
		}
	`;

	// Récupérer les catégories
	const GET_CATEGORIES = gql`
		query {
			categories {
				edges {
					node {
						...CategoryFields
					}
				}
			}
		}
		${CATEGORY_FIELDS}
	`;
	const {
		data: categoriesData,
		loading: categoriesLoading,
		error: categoriesError,
		refetch,
	} = useQuery(GET_CATEGORIES, {
		fetchPolicy: 'network-only',
	});
	useEffect(() => {
		if (categoriesLoading) {
			setLoading(true);
		}
		if (categoriesData || categoriesError) {
			setLoading(false);
		}
		if (categoriesData) {
			setCategories(categoriesData.categories.edges.map((edge: { node: Category }) => edge.node));
		}
		if (categoriesError) {
			showAlert({ severity: 'error', message: 'Une erreur est survenue lors de la récupération des catégories.', date: Date.now().toString() });
			console.error(categoriesError);
		}
	}, [categoriesLoading, categoriesData, categoriesError]);

	// Ajouter une catégorie
	const ADD_CATEGORY = gql`
		mutation CreateCategory($name: String!, $color: String, $icon: String, $personalizedIconFile: Upload, $space: String, $parent: String) {
			createCategory(input: { name: $name, color: $color, icon: $icon, personalizedIconFile: $personalizedIconFile, space: $space, parent: $parent }) {
				category {
					...CategoryFields
				}
			}
		}
		${CATEGORY_FIELDS}
	`;
	const [addCategory, { data: addCategoryData, loading: addCategoryLoaging, error: addCategoryError }] = useMutation(ADD_CATEGORY, {
		onCompleted: () => {
			refetch(); // Refait la requête après la mutation
		},
	});
	useEffect(() => {
		if (addCategoryLoaging) {
			setLoading(true);
		}
		if (addCategoryData || addCategoryError) {
			setLoading(false);
		}
		if (addCategoryData) {
			showAlert({ severity: 'success', message: 'La catégorie a bien été ajouté.', date: Date.now().toString() });
		}
		if (addCategoryError) {
			showAlert({ severity: 'error', message: "Une erreur est survenue lors de l'ajout de la catégorie.", date: Date.now().toString() });
		}
	}, [addCategoryLoaging, addCategoryData, addCategoryError]);

	// Modifier une catégorie
	const UPDATE_CATEGORY = gql`
		mutation UpdateCategory($id: ID!, $name: String, $color: String, $icon: String, $personalizedIconFile: Upload, $space: String, $parent: String) {
			updateCategory(input: { id: $id, name: $name, color: $color, icon: $icon, personalizedIconFile: $personalizedIconFile, space: $space, parent: $parent }) {
				category {
					...CategoryFields
				}
			}
		}
		${CATEGORY_FIELDS}
	`;
	const [updateCategory, { data: updateCategoryData, loading: updateCategoryLoaging, error: updateCategoryError }] = useMutation(UPDATE_CATEGORY, {
		onCompleted: () => {
			refetch(); // Refait la requête après la mutation
		},
	});
	useEffect(() => {
		if (updateCategoryLoaging) {
			setLoading(true);
		}
		if (updateCategoryData || updateCategoryError) {
			setLoading(false);
		}
	}, [updateCategoryLoaging, updateCategoryData, updateCategoryError]);

	// Supprimer une catégorie
	const DELETE_CATEGORY = gql`
		mutation deleteCategory($id: ID!) {
			deleteCategory(input: { id: $id }) {
				category {
					id
				}
			}
		}
	`;
	const [deleteCategory, { data: deleteCategoryData, loading: deleteCategoryLoaging, error: deleteCategoryError }] = useMutation(DELETE_CATEGORY, {
		refetchQueries: [GET_CATEGORIES, 'GetCategories'],
	});
	useEffect(() => {
		if (deleteCategoryLoaging) {
			setLoading(true);
		}
		if (deleteCategoryData || deleteCategoryError) {
			setLoading(false);
		}
		if (deleteCategoryData) {
			showAlert({ severity: 'success', message: 'La catégorie a bien été supprimé.', date: Date.now().toString() });
		}
		if (deleteCategoryError) {
			showAlert({ severity: 'error', message: 'Une erreur est survenue lors de la suppression de la catégorie.', date: Date.now().toString() });
		}
	}, [deleteCategoryLoaging, deleteCategoryData, deleteCategoryError]);

	return <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, loading }}>{children}</CategoryContext.Provider>;
};

// Hook pour utiliser le contexte
export const useCategories = (): CategoryContextType => {
	const context = useContext(CategoryContext);
	if (!context) {
		throw new Error("useCategories doit être utilisé à l'intérieur d'un CategoryProvider");
	}
	return context;
};
