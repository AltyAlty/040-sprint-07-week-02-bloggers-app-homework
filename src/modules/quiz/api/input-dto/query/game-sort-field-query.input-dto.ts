/*Input DTO для разрешенных значений query-параметра "sortBy", используемого при сортировке игр с пагинацией.*/
export enum GameSortFieldQueryInputDTO {
  Status = 'status',
  PairCreatedDate = 'pairCreatedDate',
  StartGameDate = 'startGameDate',
  FinishGameDate = 'finishGameDate',
}
