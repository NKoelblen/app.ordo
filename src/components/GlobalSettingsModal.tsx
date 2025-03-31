import { Modal, Box, Button, Typography, Fade, Backdrop, Stack } from '@mui/material';
import '../styles/components/SpaceForm.scss';
import SettingsTabs from './SettingsTabs';

interface GlobalSettingsModalProps {
	open: boolean;
	handleClose: () => void;
}

const GlobalSettingsModal = ({ open, handleClose }: GlobalSettingsModalProps) => {
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
						Paramètres
					</Typography>

					<SettingsTabs />

					<Stack
						direction="row"
						justifyContent="flex-end"
					>
						<Button
							onClick={handleClose}
							sx={{ mr: 1 }}
						>
							Fermer
						</Button>
					</Stack>
				</Box>
			</Fade>
		</Modal>
	);
};

export default GlobalSettingsModal;
