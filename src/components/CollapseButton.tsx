import React, { forwardRef } from 'react';
import { IconButton, IconButtonProps } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface CollapseButtonProps extends IconButtonProps {
	collapsed: boolean;
}

export const CollapseButton = forwardRef<React.ComponentRef<typeof IconButton>, CollapseButtonProps>(({ collapsed, ...props }, ref) => {
	return (
		<IconButton
			size="small"
			ref={ref}
			{...props}
			tabIndex={0}
			className={`collapse ${collapsed ? 'collapsed' : ''}`}
		>
			<ExpandMoreIcon fontSize="inherit" />
		</IconButton>
	);
});
