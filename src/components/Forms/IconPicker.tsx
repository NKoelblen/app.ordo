import { Grid2 as Grid, IconButton, Pagination, TextField, Tooltip } from '@mui/material';
import * as MuiIcons from '@mui/icons-material';
import '../../styles/components/iconPicker.scss';
import Picker from './Picker';
import { useMemo, useState } from 'react';

interface IconPickerProps {
	icon: string | undefined;
	onIconChange: (icon: string) => void;
}
const IconPicker = ({ icon, onIconChange }: IconPickerProps) => {
	const IconComponent = (MuiIcons as any)[icon || 'EmojiEmotions'];
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const iconsPerPage = 50;
	const iconNames = useMemo(
		() =>
			Object.keys(MuiIcons).filter(
				(iconName) =>
					!iconName.includes('Outlined') &&
					!iconName.includes('Rounded') &&
					!iconName.includes('TwoTone') &&
					!iconName.includes('Sharp') &&
					iconName.toLowerCase().includes(search.toLowerCase())
			),
		[search]
	);
	const totalPages = Math.ceil(iconNames.length / iconsPerPage);
	const paginatedIcons = iconNames.slice((page - 1) * iconsPerPage, page * iconsPerPage);

	return (
		<Picker
			className="icon-picker"
			label="Icône"
			icon={<IconComponent />}
		>
			<TextField
				className="icon-search"
				size="small"
				placeholder="Rechercher une icône..."
				type="search"
				value={search}
				onChange={(e) => {
					setSearch(e.target.value);
					setPage(1);
				}}
			/>
			<Grid
				container
				className="icon-grid"
			>
				{paginatedIcons.map((iconName) => {
					const IconComponent = (MuiIcons as any)[iconName];

					return (
						<Grid key={iconName}>
							<Tooltip title={iconName}>
								<IconButton
									onClick={() => {
										onIconChange(iconName);
									}}
									// size="small"
								>
									<IconComponent />
								</IconButton>
							</Tooltip>
						</Grid>
					);
				})}
			</Grid>
			{totalPages > 1 && (
				<Pagination
					count={totalPages}
					page={page}
					onChange={(_, value) => setPage(value)}
					// size="small"
				/>
			)}
		</Picker>
	);
};

export default IconPicker;
