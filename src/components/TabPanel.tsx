import * as React from 'react';
import Box from '@mui/material/Box';

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

export default function CustomTabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<Box
			role="tabpanel"
			hidden={value !== index}
			id={`tabpanel-${index}`}
			{...other}
			className="tabpanel"
		>
			{value === index && children}
		</Box>
	);
}
