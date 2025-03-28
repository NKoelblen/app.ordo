import { useState } from 'react';
import { Modal, Box, TextField, Button, Typography, Fade, Backdrop, FormControlLabel, Checkbox, Stack } from '@mui/material';
import { useSpaces } from '../../contexts/SpaceContext';
import { Space } from '../../contexts/SpaceContext';
import ColorPicker from '../Forms/ColorPicker';
import IconPicker from '../Forms/IconPicker';
import '../../styles/components/SpaceForm.scss';

// const modalStyle = {
// 	position: 'absolute' as 'absolute',
// 	top: '50%',
// 	left: '50%',
// 	transform: 'translate(-50%, -50%)',
// 	width: 400,
// 	bgcolor: 'background.paper',
// 	boxShadow: 24,
// 	p: 4,
// 	borderRadius: '8px',
// };

interface SpaceFormProps {
	open: boolean;
	handleClose: () => void;
	parentSpace?: Space | null;
}

const SpaceForm = ({ open, handleClose, parentSpace }: SpaceFormProps) => {
	const { addSpace } = useSpaces();
	const [name, setName] = useState('');
	const [professional, setProfessional] = useState(false);
	const [color, setColor] = useState<string | undefined>(undefined);
	const [icon, setIcon] = useState<string | undefined>(undefined);
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await addSpace({
			name,
			status: 'open',
			professional,
			color,
			icon,
			parent: parentSpace || null,
		});
		setName('');
		setProfessional(false);
		handleClose();
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
						{parentSpace ? `Ajouter un sous-espace à ${parentSpace.name}` : 'Ajouter un espace'}
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

						<FormControlLabel
							control={
								<Checkbox
									checked={parentSpace ? parentSpace.professional : professional}
									onChange={(e) => setProfessional(e.target.checked)}
									disabled={!!parentSpace}
								/>
							}
							label="Professionnel"
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
								icon={icon}
								onIconChange={(newIcon) => setIcon(newIcon)}
							/>
						</Stack>

						<Box
							display="flex"
							justifyContent="flex-end"
							mt={2}
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
								variant="contained"
								color="primary"
							>
								Ajouter
							</Button>
						</Box>
					</form>
				</Box>
			</Fade>
		</Modal>
	);
};

export default SpaceForm;
