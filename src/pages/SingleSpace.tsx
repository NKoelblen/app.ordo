import { useParams } from 'react-router-dom';
import { useSpaces } from '../contexts/SpaceContext';
import { useEffect } from 'react';

const SingleSpace = () => {
	const { id } = useParams<{ id: string }>();
	const { space, getSpace } = useSpaces();

	useEffect(() => {
		if (id) {
			getSpace(`api/spaces/${id}`);
		}
	}, [id, getSpace]);

	if (!space) {
		return <p>Chargement...</p>;
	}

	return (
		<>
			<h1>Bienvenue sur l'espace {space.name} !</h1>
			<p>Ceci est le contenu principal de l'espace.</p>
		</>
	);
};

export default SingleSpace;
