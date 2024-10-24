// export class Channel {
//   admin: {
//     userId: string;
//     userName: string;
//     photoURL: string;
//   };
//   channelId: string;
//   channelName: string;
//   description: string;
//   members: {
//     userId: string;
//     userName: string;
//     photoURL: string;
//   }[];
//   messages: {
//     content: string;
//     messageId: string;
//     reactions: {
//       emoji: string;
//       count: number;
//     }[];
//     thread: {
//       messages: {
//         content: string;
//         messageId: string;
//         reactions: {
//           emoji: string;
//           count: number;
//         }[];
//         time: string;
//         user: {
//           userId: string;
//           userName: string;
//           photoURL: string;
//         };
//       }[];
//     };
//     time: string;
//     user: {
//       userId: string;
//       userName: string;
//       photoURL: string;
//     };
//   }[];

//   constructor(
//     admin: { userId: string; userName: string; photoURL: string },
//     channelId: string,
//     channelName: string,
//     description: string,
//     members: { userId: string; userName: string; photoURL: string }[],
//     messages: {
//       content: string;
//       messageId: string;
//       reactions: { emoji: string; count: number }[];
//       thread: {
//         messages: {
//           content: string;
//           messageId: string;
//           reactions: { emoji: string; count: number }[];
//           time: string;
//           user: { userId: string; userName: string; photoURL: string };
//         }[];
//       };
//       time: string;
//       user: { userId: string; userName: string; photoURL: string };
//     }[]
//   ) {
//     this.admin = admin;
//     this.channelId = channelId;
//     this.channelName = channelName;
//     this.description = description;
//     this.members = members;
//     this.messages = messages;
//   }
// }

//NOTE - Ich musste den Channel umschreiben lassen, da ich am Anfang einen leeren Channel erstelle

export class Channel {
  admin: {
    userId: string;
    userName: string;
    photoURL: string;
  };
  channelId: string;
  channelName: string;
  description: string;
  members: {
    userId: string;
    userName: string;
    photoURL: string;
  }[];
  messages: {
    content: string;
    messageId: string;
    reactions: {
      emoji: string;
      count: number;
    }[];
    thread: {
      messages: {
        content: string;
        messageId: string;
        reactions: {
          emoji: string;
          count: number;
        }[];
        time: string;
        user: {
          userId: string;
          userName: string;
          photoURL: string;
        };
      }[];
    };
    time: string;
    user: {
      userId: string;
      userName: string;
      photoURL: string;
    };
  }[];

  constructor(
    admin: { userId: string; userName: string; photoURL: string } = {
      userId: '',
      userName: '',
      photoURL: '',
    },
    channelId: string = '',
    channelName: string = '',
    description: string = '',
    members: { userId: string; userName: string; photoURL: string }[] = [],
    messages: {
      content: string;
      messageId: string;
      reactions: { emoji: string; count: number }[];
      thread: {
        messages: {
          content: string;
          messageId: string;
          reactions: { emoji: string; count: number }[];
          time: string;
          user: { userId: string; userName: string; photoURL: string };
        }[];
      };
      time: string;
      user: { userId: string; userName: string; photoURL: string };
    }[] = []
  ) {
    this.admin = admin;
    this.channelId = channelId;
    this.channelName = channelName;
    this.description = description;
    this.members = members;
    this.messages = messages;
  }
}
