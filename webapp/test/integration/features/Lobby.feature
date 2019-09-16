Feature: Play the Game

	Background:
		Given I have started the app

	Scenario: Start the game
		Given server return following data in game start:

			| bankerCards | [{"kind":"king","suit":"diamonds"}] |
			| playerCards | [{"kind":"ace","suit":"hearts"}]    |
			| status      | "ongoing"                           |

		When I start the game
		Then banker should have card (diamonds king)
		And player should have card (hearts ace)