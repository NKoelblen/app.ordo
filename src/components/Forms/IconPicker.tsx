import { Grid2 as Grid, IconButton, Pagination, TextField, Tooltip } from '@mui/material';
import * as MuiIcons from '@mui/icons-material';
import '../../styles/components/iconPicker.scss';
import Picker from './Picker';
import { useMemo, useState } from 'react';
import IconUploader from './IconUploader';
import { ReactSVG } from 'react-svg';

interface IconPickerProps {
	icon: string | File | null | undefined;
	isPersonalizedIcon: boolean;
	onIconChange: (icon: string | undefined) => void;
	onIconUpload: (icon: File | null) => void;
}
const IconPicker = ({ icon, isPersonalizedIcon, onIconChange, onIconUpload }: IconPickerProps) => {
	const IconComponent = (MuiIcons as any)[(icon as string) || 'EmojiSymbols'];
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
	const [personalizedIconFile, setPersonalizedIconFile] = useState<File | string | null | undefined>(isPersonalizedIcon ? icon : undefined);

	return (
		<Picker
			className="icon-picker"
			label="Icône"
			icon={
				isPersonalizedIcon ? (
					typeof icon === 'string' ? (
						<ReactSVG src={'https://localhost' + icon} />
					) : (
						<ReactSVG src={URL.createObjectURL(icon as File)} />
					)
				) : (
					<IconComponent />
				)
			}
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
										setPersonalizedIconFile(null);
										onIconUpload(null);
									}}
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
				/>
			)}
			<IconUploader
				icon={personalizedIconFile}
				onIconChange={(newIcon) => {
					setPersonalizedIconFile(newIcon);
					onIconUpload(newIcon);
					onIconChange(undefined);
				}}
			></IconUploader>
		</Picker>
	);
};

export default IconPicker;
