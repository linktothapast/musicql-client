import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import gql from 'graphql-tag';

@Component({
  selector: 'musicql-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {

  rooms$: any;

  constructor(private apollo: Apollo) {
    const RoomsQuery = gql`
      query RoomsQuery {
        rooms {
          _id
          name
        }
      }
    `;
    this.rooms$ = this.apollo.watchQuery({
      query: RoomsQuery
    }).map((result: any) => result.data.rooms);
  }

  ngOnInit() {

  }

  createRoom() {
    const name = prompt('Give it a good name');
    if (name) {
      const AddRoomMutation = gql`
        mutation addRoomMutation($name: String!) {
          addRoom(name: $name) {
            _id
            name
          }
        }
      `;
      this.apollo.mutate({
        mutation: AddRoomMutation,
        variables: { name },
        optimisticResponse: {
          __typename: 'Mutation',
          addRoom: {
            __typename: 'Room',
            _id: 'unknown',
            name: name
          }
        },
        updateQueries: {
          RoomsQuery: (prev, { mutationResult }) => {
            const newRoom = mutationResult.data.addRoom;
            const prevRooms = prev.rooms;
            return {
              rooms: [...prevRooms, newRoom]
            };
          },
        }
      }).subscribe();
    }
  }

}
