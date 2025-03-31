import { Box, IconButton, Stack, useTheme } from '@mui/material';
import * as MuiIcons from '@mui/icons-material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Member, useMembers } from '../../contexts/MemberContext';
import { getContrastColor } from '../../utilities';
import { ReactSVG } from 'react-svg';
import { useState } from 'react';
import MemberForm from './MemberForm';
import { Space } from '../../contexts/SpaceContext';
import '../../styles/components/MembersList.scss';

interface MembersListProps {
	space?: Space;
}

const MembersList = ({ space }: MembersListProps) => {
	const { members, deleteMember } = useMembers();
	const [selectedMember, setSelectedMember] = useState<null | Member>(null);

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const theme = useTheme();

	type IconProps = { member: Member };
	const Icon = ({ member }: IconProps) => {
		const IconComponent = (MuiIcons as any)[member.icon || ''];
		return (
			<Box className="member-icon">
				{member.personalizedIconUrl ? (
					<ReactSVG src={`https://localhost${member.personalizedIconUrl}`} />
				) : member.icon ? (
					<IconComponent />
				) : (
					member.name.charAt(0).toUpperCase()
				)}
			</Box>
		);
	};

	return (
		<Stack
			direction="row"
			className="members-list"
		>
			{members
				.filter((member) => (space ? member.space?.id === space.id : !member.space))
				.map((member) => (
					<Stack
						direction="row"
						key={member.id}
						className="member-item"
						sx={{ backgroundColor: member.color, color: member.color ? getContrastColor(member.color, theme) : 'inherit' }}
					>
						<Icon member={member} />
						<span className="member-name">{member.name}</span>
						<Stack direction="row">
							<IconButton
								id={`edit-button-${member.id}`}
								size="small"
								className="edit-button"
								onClick={(event) => {
									setAnchorEl(event.currentTarget);
									setSelectedMember(member);
								}}
								color="inherit"
							>
								<EditIcon fontSize="inherit" />
							</IconButton>
							<IconButton
								id={`delete-button-${member.id}`}
								size="small"
								className="delete-button"
								onClick={() => {
									confirm('Êtes-vous sûr de vouloir supprimer ce membre ?');
									deleteMember({ variables: { id: member.id } });
								}}
								color="inherit"
							>
								<DeleteIcon fontSize="inherit" />
							</IconButton>
						</Stack>
					</Stack>
				))}
			<IconButton
				id={`add-member-button`}
				size="small"
				className="add-button"
				onClick={(event) => {
					setAnchorEl(event.currentTarget);
				}}
			>
				<AddIcon
					fontSize="inherit"
					color="primary"
				/>
			</IconButton>

			<MemberForm
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				handleClose={() => {
					setAnchorEl(null);
					setSelectedMember(null);
				}}
				member={selectedMember}
				space={space}
			></MemberForm>
		</Stack>
	);
};
export default MembersList;
