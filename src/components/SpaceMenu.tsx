import { Menu, MenuItem, ListItemIcon, ListItemText, Checkbox, FormControlLabel } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface SpaceMenuProps {
	anchorEl: HTMLElement | null;
	open: boolean;
	onClose: () => void;
	space: any; // Remplacez `any` par le type approprié pour `space`
	onRename: () => void;
	onToggleProfessional: (isProfessional: boolean) => void;
	onDelete: () => void;
}

const SpaceMenu: React.FC<SpaceMenuProps> = ({ anchorEl, open, onClose, space, onRename, onToggleProfessional, onDelete }) => {
	return (
		<Menu
			anchorEl={anchorEl}
			open={open}
			onClose={onClose}
			anchorOrigin={{
				vertical: 'top',
				horizontal: 'right',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'left',
			}}
			sx={{ mt: -0.75 }}
		>
			<MenuItem onClick={onRename}>
				<ListItemIcon>
					<EditIcon />
				</ListItemIcon>
				<ListItemText>Renommer</ListItemText>
			</MenuItem>
			<MenuItem>
				<FormControlLabel
					control={
						<Checkbox
							checked={space.professional}
							onChange={() => onToggleProfessional(!space.professional)}
							disabled={space.parent !== null}
						/>
					}
					label="Professionnel"
				/>
			</MenuItem>
			<MenuItem onClick={onDelete}>
				<ListItemIcon>
					<DeleteIcon />
				</ListItemIcon>
				<ListItemText>Supprimer</ListItemText>
			</MenuItem>
		</Menu>
	);
};

export default SpaceMenu;
