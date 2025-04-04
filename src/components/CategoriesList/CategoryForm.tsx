import { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Stack, Popover, PopoverVirtualElement } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { Space } from '../../contexts/SpaceContext';
import ColorPicker from '../Forms/ColorPicker';
import IconPicker from '../Forms/IconPicker';
import '../../styles/components/SpaceForm.scss';
import { useAlerts } from '../../contexts/AlertContext';
import { Category, useCategories } from '../../contexts/CategoryContext';

interface CategoryFormProps {
	open: boolean;
	handleClose: () => void;
	category?: Category | null;
	space?: Space | null;
	parent?: Category | null;
	anchorEl: PopoverVirtualElement | null;
}

const CategoryForm = ({ open, handleClose, category, space, parent, anchorEl }: CategoryFormProps) => {
	const { addCategory, updateCategory, loading } = useCategories();
	const [name, setName] = useState(category ? category.name : '');
	const [color, setColor] = useState<string | undefined>(category ? category.color ?? undefined : undefined);
	const [icon, setIcon] = useState<string | undefined>(category ? category.icon ?? undefined : undefined);
	const [personalizedIconFile, setPersonalizedIconFile] = useState<File | string | null | undefined>(undefined);

	const { showAlert } = useAlerts();
	const closeModal = () => {
		handleClose();
		setName('');
		setColor(undefined);
		setIcon(undefined);
		setPersonalizedIconFile(undefined);
	};

	useEffect(() => {
		if (category) {
			setName(category.name);
			setColor(category.color ?? undefined);
			setIcon(category.icon ?? undefined);
			setPersonalizedIconFile(category.personalizedIconUrl ?? undefined);
		} else {
			setName('');
			setColor(undefined);
			setIcon(undefined);
			setPersonalizedIconFile(undefined);
		}
	}, [category]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (category) {
			const { errors } = await updateCategory({
				variables: {
					id: category.id,
					name,
					color,
					icon,
					personalizedIconFile,
					space: category.space?.id || null,
					parent: category.parent?.id || null,
				},
			});

			if (errors) {
				showAlert({ severity: 'error', message: 'Erreur lors de la mise à jour du membre.', date: Date.now().toString() });
			} else {
				showAlert({ severity: 'success', message: 'Le membre a été mis à jour avec succès.', date: Date.now().toString() });
				closeModal();
			}
		} else {
			const { errors } = await addCategory({
				variables: {
					name,
					color,
					icon,
					space: space?.id || null,
					personalizedIconFile,
					parent: parent?.id || null,
				},
			});
			if (!errors) {
				closeModal();
			}
		}
	};

	return (
		<Popover
			className={`picker category-form`}
			open={open}
			onClose={handleClose}
			anchorEl={anchorEl}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'center',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'center',
			}}
		>
			<Box className="modal-form-content">
				<Typography
					variant="h6"
					component="h2"
				>
					{category ? `Modifier la catégorie ${category.name}` : 'Ajouter une catégorie'}
				</Typography>
				<form
					onSubmit={handleSubmit}
					id="space-form"
				>
					<TextField
						label="Nom"
						value={name}
						onChange={(e) => setName(e.target.value)}
						margin="normal"
						required
					/>

					<Stack
						id="pickers"
						direction="row"
					>
						<ColorPicker
							color={color}
							onColorChange={(newColor) => setColor(newColor)}
						/>

						<IconPicker
							icon={personalizedIconFile ?? icon}
							isPersonalizedIcon={Boolean(personalizedIconFile)}
							onIconChange={(newIcon) => setIcon(newIcon)}
							onIconUpload={(newIcon) => setPersonalizedIconFile(newIcon)}
						/>
					</Stack>

					<Stack
						direction="row"
						justifyContent="flex-end"
					>
						<Button
							onClick={handleClose}
							color="secondary"
							sx={{ mr: 1 }}
						>
							Annuler
						</Button>
						<Button
							type="submit"
							loading={loading}
							loadingPosition="end"
							startIcon={<SaveIcon />}
						>
							{category ? 'Enregistrer' : 'Ajouter'}
						</Button>
					</Stack>
				</form>
			</Box>
		</Popover>
	);
};

export default CategoryForm;
