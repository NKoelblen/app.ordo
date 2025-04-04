import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import apolloClient from './services/apolloClient';
import { AlertsProvider } from './contexts/AlertContext';
import { SpaceProvider } from './contexts/SpaceContext';
import App from './App';
import Home from './pages/Home';
import SingleSpace from './pages/SingleSpace';
import { MemberProvider } from './contexts/MemberContext';
import { CategoryProvider } from './contexts/CategoryContext';

const rootElement = document.getElementById('root') as HTMLElement;

const root = ReactDOM.createRoot(rootElement);

root.render(
	<React.StrictMode>
		<BrowserRouter>
			<ApolloProvider client={apolloClient}>
				<AlertsProvider>
					<SpaceProvider>
						<MemberProvider>
							<CategoryProvider>
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
							</CategoryProvider>
						</MemberProvider>
					</SpaceProvider>
				</AlertsProvider>
			</ApolloProvider>
		</BrowserRouter>
	</React.StrictMode>
);
