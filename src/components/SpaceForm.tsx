import { useState } from 'react';
import { Modal, Box, TextField, Button, Typography, Fade, Backdrop, FormControlLabel, Checkbox } from '@mui/material';
import { useSpaces } from '../contexts/SpaceContext';

const modalStyle = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	boxShadow: 24,
	p: 4,
	borderRadius: '8px',
};

interface AddSpaceModalProps {
	open: boolean;
	handleClose: () => void;
}

const AddSpaceModal = ({ open, handleClose }: AddSpaceModalProps) => {
	const { addSpace } = useSpaces();
	const [name, setName] = useState('');
	const [professional, setProfessional] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await addSpace({
			name,
			status: 'open',
			professional,
			parent: null,
		});
		setName('');
		setProfessional(false);
		handleClose();
	};

	return (
		<Modal
			open={open}
			onClose={handleClose}
			closeAfterTransition
			BackdropComponent={Backdrop}
			BackdropProps={{ timeout: 500 }}
		>
			<Fade in={open}>
				<Box sx={modalStyle}>
					<Typography
						variant="h6"
						component="h2"
						gutterBottom
					>
						Ajouter un espace
					</Typography>
					<form onSubmit={handleSubmit}>
						<TextField
							fullWidth
							label="Nom"
							value={name}
							onChange={(e) => setName(e.target.value)}
							margin="normal"
							required
						/>
						<FormControlLabel
							control={
								<Checkbox
									checked={professional}
									onChange={(e) => setProfessional(e.target.checked)}
								/>
							}
							label="Professionnel"
						/>
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

export default AddSpaceModal;
