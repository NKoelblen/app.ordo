import { Tabs, Tab } from '@mui/material';
import { Groups as GroupsIcon, Inbox as InboxIcon } from '@mui/icons-material';
import '../styles/components/SpaceForm.scss';
import { useState } from 'react';
import CustomTabPanel from './TabPanel';
import MembersList from './MembersList/MembersList';
import { Space } from '../contexts/SpaceContext';

interface MSettingsTabsProps {
	space?: Space;
}

const SettingsTabs = ({ space }: MSettingsTabsProps) => {
	const [value, setValue] = useState(0);

	const handleChange = (_: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	return (
		<>
			<Tabs
				value={value}
				onChange={handleChange}
			>
				<Tab
					icon={<GroupsIcon />}
					label="Membres"
				/>
				<Tab
					icon={<InboxIcon />}
					label="Catégories"
				/>
			</Tabs>
			<CustomTabPanel
				value={value}
				index={0}
			>
				<MembersList space={space} />
			</CustomTabPanel>
			<CustomTabPanel
				value={value}
				index={1}
			>
				Catégories
			</CustomTabPanel>
		</>
	);
};

export default SettingsTabs;
