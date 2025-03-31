import { useEffect, useState } from 'react';
import { Modal, Box, TextField, Button, Typography, Fade, Backdrop, FormControlLabel, Checkbox, Stack } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useSpaces } from '../../contexts/SpaceContext';
import { Space } from '../../contexts/SpaceContext';
import ColorPicker from '../Forms/ColorPicker';
import IconPicker from '../Forms/IconPicker';
import '../../styles/components/SpaceForm.scss';
import { useAlerts } from '../../contexts/AlertContext';
import SettingsTabs from '../SettingsTabs';

interface SpaceFormProps {
	open: boolean;
	handleClose: () => void;
	space?: Space | null;
	parentSpace?: Space | null;
}

const SpaceForm = ({ open, handleClose, space, parentSpace }: SpaceFormProps) => {
	const { addSpace, updateSpace, loading } = useSpaces();
	const [name, setName] = useState(space ? space.name : '');
	const [professional, setProfessional] = useState(space ? space.professional : false);
	const [color, setColor] = useState<string | undefined>(space ? space.color ?? undefined : undefined);
	const [icon, setIcon] = useState<string | undefined>(space ? space.icon ?? undefined : undefined);
	const [personalizedIconFile, setPersonalizedIconFile] = useState<File | string | null | undefined>(undefined);

	const { showAlert } = useAlerts();
	const closeModal = () => {
		handleClose();
		setName('');
		setProfessional(false);
		setColor(undefined);
		setIcon(undefined);
		setPersonalizedIconFile(undefined);
	};

	useEffect(() => {
		if (space) {
			setName(space.name);
			setProfessional(space.professional);
			setColor(space.color ?? undefined);
			setIcon(space.icon ?? undefined);
			setPersonalizedIconFile(space.personalizedIconUrl ?? undefined);
		} else {
			setName('');
			setProfessional(false);
			setColor(undefined);
			setIcon(undefined);
			setPersonalizedIconFile(undefined);
		}
	}, [space]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (space) {
			const { errors } = await updateSpace({
				variables: {
					id: space.id,
					name,
					professional,
					color,
					icon,
					parent: space.parent?.id || null,
					personalizedIconFile,
				},
			});

			if (errors) {
				showAlert({ severity: 'error', message: "Erreur lors de la mise à jour de l'espace.", date: Date.now().toString() });
			} else {
				showAlert({ severity: 'success', message: "L'espace a été mis à jour avec succès.", date: Date.now().toString() });
				closeModal();
			}
		} else {
			const { errors } = await addSpace({
				variables: {
					name,
					status: 'open',
					professional,
					color,
					icon,
					parent: parentSpace?.id || null,
					personalizedIconFile,
				},
			});
			if (!errors) {
				closeModal();
			}
		}
	};

	return (
		<Modal
			className="modal-form"
			open={open}
			onClose={handleClose}
			closeAfterTransition
			slots={{ backdrop: Backdrop }}
			slotProps={{ backdrop: { timeout: 500 } }}
		>
			<Fade in={open}>
				<Box
					className="modal-form-content"
					sx={{ bgcolor: 'background.paper', border: `1px solid divider` }}
				>
					<Typography
						variant="h6"
						component="h2"
					>
						{space ? `Modifier l'espace ${space.name}` : parentSpace ? `Ajouter un sous-espace à ${parentSpace.name}` : 'Ajouter un espace'}
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
							<FormControlLabel
								control={
									<Checkbox
										checked={parentSpace ? parentSpace.professional : professional}
										onChange={(e) => setProfessional(e.target.checked)}
										disabled={!!parentSpace || !!space?.parent}
									/>
								}
								label="Professionnel"
								className="checkbox-label"
							/>
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

						{space && <SettingsTabs space={space} />}

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
								{space ? 'Enregistrer' : 'Ajouter'}
							</Button>
						</Stack>
					</form>
				</Box>
			</Fade>
		</Modal>
	);
};

export default SpaceForm;
