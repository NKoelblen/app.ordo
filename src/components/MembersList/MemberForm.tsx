import { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Stack, Popover } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { Space } from '../../contexts/SpaceContext';
import ColorPicker from '../Forms/ColorPicker';
import IconPicker from '../Forms/IconPicker';
import '../../styles/components/SpaceForm.scss';
import { useAlerts } from '../../contexts/AlertContext';
import { Member, useMembers } from '../../contexts/MemberContext';

interface MemberFormProps {
	open: boolean;
	handleClose: () => void;
	member?: Member | null;
	space?: Space | null;
	anchorEl: HTMLElement | null;
}

const MemberForm = ({ open, handleClose, member, space, anchorEl }: MemberFormProps) => {
	const { addMember, updateMember, loading } = useMembers();
	const [name, setName] = useState(member ? member.name : '');
	const [color, setColor] = useState<string | undefined>(member ? member.color ?? undefined : undefined);
	const [icon, setIcon] = useState<string | undefined>(member ? member.icon ?? undefined : undefined);
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
		if (member) {
			setName(member.name);
			setColor(member.color ?? undefined);
			setIcon(member.icon ?? undefined);
			setPersonalizedIconFile(member.personalizedIconUrl ?? undefined);
		} else {
			setName('');
			setColor(undefined);
			setIcon(undefined);
			setPersonalizedIconFile(undefined);
		}
	}, [member]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (member) {
			const { errors } = await updateMember({
				variables: {
					id: member.id,
					name,
					color,
					icon,
					personalizedIconFile,
					space: member.space?.id || null,
				},
			});

			if (errors) {
				showAlert({ severity: 'error', message: 'Erreur lors de la mise à jour du membre.', date: Date.now().toString() });
			} else {
				showAlert({ severity: 'success', message: 'Le membre a été mis à jour avec succès.', date: Date.now().toString() });
				closeModal();
			}
		} else {
			const { errors } = await addMember({
				variables: {
					name,
					color,
					icon,
					space: space?.id || null,
					personalizedIconFile,
				},
			});
			if (!errors) {
				closeModal();
			}
		}
	};

	return (
		<Popover
			className={`picker member-form`}
			open={open}
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
					{member ? `Modifier le membre ${member.name}` : 'Ajouter un membre'}
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
							{member ? 'Enregistrer' : 'Ajouter'}
						</Button>
					</Stack>
				</form>
			</Box>
		</Popover>
	);
};

export default MemberForm;
