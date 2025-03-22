import React, { createContext, useState, useContext, useEffect } from 'react';

// Définition du type Space
export interface Space {
	id: number;
	name: string;
	status: 'open' | 'archived';
	professional: boolean;
	parent?: number | null;
}

// Type du contexte
interface SpaceContextType {
	spaces: Space[];
	addSpace: (newSpace: Omit<Space, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

// Création du contexte
const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

// Provider du contexte
export const SpaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [spaces, setSpaces] = useState<Space[]>([]);

	// Récupérer les espaces depuis l'API
	useEffect(() => {
		fetch('http://localhost/api/spaces')
			.then((res) => res.json())
			.then((data) => {
				setSpaces(data.member);
			})
			.catch((error) => {
				console.error('Erreur lors de la récupération des espaces:', error);
			});
	}, []);

	const addSpace = async (newSpace: Omit<Space, 'id' | 'createdAt' | 'updatedAt'>) => {
		try {
			const response = await fetch('http://localhost/api/spaces', {
				method: 'POST',
				headers: {
					Accept: 'application/ld+json',
					'Content-Type': 'application/ld+json',
				},
				body: JSON.stringify(newSpace),
			});

			const responseData = await response.json();

			if (!response.ok) {
				throw new Error(responseData.message);
			}

			setSpaces((prevSpaces) => [...prevSpaces, responseData]);
		} catch (error: any) {
			alert(`Erreur : ${error.message}`);
		}
	};

	return <SpaceContext.Provider value={{ spaces, addSpace }}>{children}</SpaceContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte
export const useSpaces = (): SpaceContextType => {
	const context = useContext(SpaceContext);
	if (!context) {
		throw new Error("useSpaces doit être utilisé à l'intérieur d'un SpaceProvider");
	}
	return context;
};
