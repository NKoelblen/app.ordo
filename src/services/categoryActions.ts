import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAlerts } from '../contexts/AlertContext';
import { Space } from './spaceActions';

// Définition du type Category
export interface Category {
	id: string;
	name: string;
	color?: string | null;
	icon?: string | null;
	personalizedIconUrl?: string | null;
	space?: Space | null;
	parent?: Category | null;
}

export const useCategoryActions = () => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [categoryLoading, setCategoryLoading] = useState<boolean>(false);
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
			setCategoryLoading(true);
		}
		if (categoriesData || categoriesError) {
			setCategoryLoading(false);
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
			setCategoryLoading(true);
		}
		if (addCategoryData || addCategoryError) {
			setCategoryLoading(false);
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
			setCategoryLoading(true);
		}
		if (updateCategoryData || updateCategoryError) {
			setCategoryLoading(false);
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
			setCategoryLoading(true);
		}
		if (deleteCategoryData || deleteCategoryError) {
			setCategoryLoading(false);
		}
		if (deleteCategoryData) {
			showAlert({ severity: 'success', message: 'La catégorie a bien été supprimé.', date: Date.now().toString() });
		}
		if (deleteCategoryError) {
			showAlert({ severity: 'error', message: 'Une erreur est survenue lors de la suppression de la catégorie.', date: Date.now().toString() });
		}
	}, [deleteCategoryLoaging, deleteCategoryData, deleteCategoryError]);

	return { categories, addCategory, updateCategory, deleteCategory, categoryLoading };
};
