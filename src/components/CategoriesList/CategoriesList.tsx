import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import * as MuiIcons from '@mui/icons-material';
import {
	KeyboardArrowDown as KeyboardArrowDownIcon,
	KeyboardArrowRight as KeyboardArrowRightIcon,
	Add as AddIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
} from '@mui/icons-material';
import { Category, useCategories } from '../../contexts/CategoryContext';
import { ReactSVG } from 'react-svg';
import React, { useMemo, useState } from 'react';
import { PopoverVirtualElement, TableFooter } from '@mui/material';
import CategoryForm from './CategoryForm';
import { Space } from '../../contexts/SpaceContext';

interface CategoriesListProps {
	space?: Space;
}

interface CategoryTreeItem extends Category {
	descendants: CategoryTreeItems;
	open: boolean;
}
type CategoryTreeItems = CategoryTreeItem[];

export default function CategoriesList({ space }: CategoriesListProps) {
	const { categories, deleteCategory } = useCategories();
	const [selectedCategory, setSelectedCategory] = useState<null | CategoryTreeItem>(null);
	const [parent, setParent] = useState<null | Category | undefined>(undefined);
	const [anchorEl, setAnchorEl] = useState<null | PopoverVirtualElement>(null);
	const handleClick = (event: React.MouseEvent<HTMLElement>, category: CategoryTreeItem | null) => {
		const getBoundingClientRect = event.currentTarget.getBoundingClientRect();
		setAnchorEl({
			getBoundingClientRect: () => getBoundingClientRect,
			nodeType: 1,
		});
		if (category) {
			setSelectedCategory(category);
		}
	};
	const [openState, setOpenState] = useState<Record<string, boolean>>({});
	const categoriesTree = useMemo(() => {
		const categoryMap: Map<string, CategoryTreeItem> = new Map();

		categories.forEach((category) => {
			categoryMap.set(category.id, {
				id: category.id,
				name: category.name,
				color: category.color ?? null,
				icon: category.icon ?? null,
				personalizedIconUrl: category.personalizedIconUrl ?? null,
				space: category.space ?? null,
				descendants: [],
				open: false,
			});
		});

		const rootCategories: CategoryTreeItems = [];

		categories.forEach((category) => {
			if (category.parent?.id) {
				const parentCategory = categoryMap.get(category.parent.id);
				if (parentCategory) {
					if (!parentCategory.descendants) {
						parentCategory.descendants = [];
					}
					parentCategory.descendants.push(categoryMap.get(category.id)!);
				}
			} else {
				rootCategories.push(categoryMap.get(category.id)!);
			}
		});

		return rootCategories;
	}, [categories]);

	function CategoryRow({ category }: { category: CategoryTreeItem }) {
		const IconComponent = (MuiIcons as any)[category.icon || ''];

		return (
			<TableRow
				key={`row-${category.id}`}
				sx={{ '& > *': { borderBottom: 'unset' } }}
			>
				<TableCell>
					{category.descendants.length > 0 && (
						<IconButton
							aria-label="expand row"
							size="small"
							onClick={() => {
								setOpenState((prevState) => ({
									...prevState,
									[category.id]: !prevState[category.id],
								}));
							}}
						>
							{openState[category.id] ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
						</IconButton>
					)}
				</TableCell>
				<TableCell className="category-label">
					<Box
						className="category-icon"
						sx={{ color: category.color ?? 'inherit' }}
					>
						{category.personalizedIconUrl ? (
							<ReactSVG src={`https://localhost${category.personalizedIconUrl}`} />
						) : category.icon ? (
							<IconComponent />
						) : (
							category.name.charAt(0).toUpperCase()
						)}
					</Box>
					<span className="category-name">{category.name}</span>
				</TableCell>
				<TableCell align="right">
					<IconButton
						id={`edit-button-${category.id}`}
						size="small"
						className="edit-button"
						onClick={(event) => {
							handleClick(event, category);
						}}
						color="success"
					>
						<EditIcon fontSize="inherit" />
					</IconButton>
				</TableCell>
				<TableCell align="right">
					<IconButton
						id={`delete-button-${category.id}`}
						size="small"
						className="delete-button"
						onClick={() => {
							if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
								deleteCategory({ variables: { id: category.id } });
							}
						}}
						color="error"
					>
						<DeleteIcon fontSize="inherit" />
					</IconButton>
				</TableCell>
				<TableCell align="right">
					<IconButton
						id={`add-button-${category.id}`}
						size="small"
						className="add-button"
						onClick={(event) => {
							handleClick(event, category);
						}}
					>
						<AddIcon
							fontSize="inherit"
							color="primary"
						/>
					</IconButton>
				</TableCell>
			</TableRow>
		);
	}

	return (
		<>
			<TableContainer component={Paper}>
				<Table>
					<TableBody>
						{categoriesTree
							.filter((category) => (space ? category.space?.id === space.id : !category.space))
							.map((category) => (
								<React.Fragment key={category.id}>
									<CategoryRow category={category} />
									{category.descendants.length > 0 && (
										<TableRow>
											<TableCell
												style={{ paddingBottom: 0, paddingTop: 0 }}
												colSpan={6}
											>
												<Collapse
													in={openState[category.id]}
													timeout="auto"
													unmountOnExit
												>
													<Table
														size="small"
														aria-label="purchases"
													>
														<TableBody>
															{category.descendants.map((descendant) => (
																<CategoryRow
																	key={descendant.id}
																	category={descendant}
																/>
															))}
														</TableBody>
													</Table>
												</Collapse>
											</TableCell>
										</TableRow>
									)}
								</React.Fragment>
							))}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TableCell
								colSpan={5}
								align="right"
							>
								<IconButton
									id={`add-category-button`}
									size="small"
									className="add-button"
									onClick={(event) => {
										handleClick(event, null);
									}}
								>
									<AddIcon
										fontSize="inherit"
										color="primary"
									/>
								</IconButton>
							</TableCell>
						</TableRow>
					</TableFooter>
				</Table>
			</TableContainer>

			<CategoryForm
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				handleClose={() => {
					setAnchorEl(null);
					setSelectedCategory(null);
					setParent(null);
				}}
				category={selectedCategory}
				space={space}
				parent={parent}
			/>
		</>
	);
}
