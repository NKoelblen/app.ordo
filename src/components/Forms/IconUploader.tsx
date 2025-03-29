import { IconButton, Stack, InputLabel } from '@mui/material';
import { ReactSVG } from 'react-svg';

interface IconUploaderProps {
	icon: string | undefined;
	setIcon: (icon: string) => void;
}
const IconUploader = ({ icon, setIcon }: IconUploaderProps) => {
	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.name.endsWith('.svg')) {
			alert('Seuls les fichiers SVG sont acceptés.');
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const result = e.target?.result as string;
			if (result.includes('<script') || result.includes('<foreignObject')) {
				alert('Fichier SVG invalide.');
				return;
			}
			setIcon(result);
		};
		reader.readAsDataURL(file);
	};

	return (
		<Stack direction="row">
			<InputLabel>Icône personnalisée</InputLabel>
			<IconButton>
				{icon ? <ReactSVG src={icon} /> : '🦆'}
				<input
					type="file"
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
