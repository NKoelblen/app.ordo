import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { SpaceProvider } from './contexts/SpaceContext';
import Home from './pages/Home';
import SingleSpace from './pages/SingleSpace';

const rootElement = document.getElementById('root') as HTMLElement;

const root = ReactDOM.createRoot(rootElement);

root.render(
	<React.StrictMode>
		<BrowserRouter>
			<SpaceProvider>
				<Routes>
					<Route element={<App />}>
						<Route
							path="/"
							element={<Home />}
						/>

						<Route
							path="/space/:id"
							element={<SingleSpace />}
						/>
					</Route>
				</Routes>
			</SpaceProvider>
		</BrowserRouter>
	</React.StrictMode>
);
