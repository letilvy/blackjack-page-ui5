Feature: Play the Game

Scenario: Player Win
	Given I start my app
	When I start the game
	Then banker should have card (clubs king)
	And player should have card (hearts ace)

	When player ask for deal
	And player get a new card (diamonds jack) which makes points equal to 21
	Then player win the game