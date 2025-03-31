import { IconButton, Stack, InputLabel } from '@mui/material';
import { ReactSVG } from 'react-svg';

interface IconUploaderProps {
	icon: File | String | null | undefined;
	onIconChange: (icon: File) => void;
}
const IconUploader = ({ icon, onIconChange }: IconUploaderProps) => {
	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.name.endsWith('.svg')) {
			alert('Seuls les fichiers SVG sont acceptés.');
			return;
		}

		onIconChange(file);
	};

	return (
		<Stack
			direction="row"
			className="picker-container icon-uploader"
		>
			<InputLabel>Icône personnalisée</InputLabel>
			<IconButton onClick={() => (document.querySelector('#icon-upload-input') as HTMLInputElement)?.click()}>
				{icon ? (
					typeof icon === 'string' ? (
						<ReactSVG src={'https://localhost' + icon} /> // Affiche l'icône provenant de l'API
					) : (
						<ReactSVG src={URL.createObjectURL(icon as File)} /> // Affiche l'icône temporaire
					)
				) : (
					'🦆'
				)}
				<input
					id="icon-upload-input"
					type="file"
					accept=".svg"
					onChange={handleFileUpload}
					style={{
						clip: 'rect(0 0 0 0)',
						clipPath: 'inset(50%)',
						height: 1,
						overflow: 'hidden',
						position: 'absolute',
						bottom: 0,
						left: 0,
						whiteSpace: 'nowrap',
						width: 1,
					}}
				/>
			</IconButton>
		</Stack>
	);
};

export default IconUploader;
