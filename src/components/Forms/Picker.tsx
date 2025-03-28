import { IconButton, IconButtonProps, InputLabel, Popover, Stack } from '@mui/material';
import { useState } from 'react';
import '../../styles/components/Picker.scss';

interface PickerProps extends IconButtonProps {
	className?: string;
	label: string;
	icon: React.ReactNode;
	children?: React.ReactNode;
}
const Picker = ({ className, label, icon, children, ...props }: PickerProps) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	return (
		<Stack
			className={`picker-container ${className}`}
			direction="row"
		>
			<InputLabel>{label}</InputLabel>
			<IconButton
				className="picker-input"
				size="small"
				onClick={(event) => setAnchorEl(event.currentTarget)}
				{...props}
			>
				{icon}
			</IconButton>
			<Popover
				className={`picker ${className}`}
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center',
				}}
			>
				{children}
			</Popover>
		</Stack>
	);
};

export default Picker;
