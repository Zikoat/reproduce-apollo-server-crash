import assert from "assert";
import { ApolloServer } from "@apollo/server";
import "reflect-metadata";
import {
  Field,
  FieldResolver,
  ObjectType,
  Query,
  Resolver,
  buildSchema,
} from "type-graphql";
import { startStandaloneServer } from "@apollo/server/standalone";

import { gql } from "graphql-tag";

@ObjectType()
class Book {
  @Field(() => String)
  public title?: string;

  @Field(() => String)
  public author?: string;
}

@ObjectType()
class LibraryResult {
  @Field(() => Book)
  public book!: Book;
}

@ObjectType()
class Author {
  @Field(() => String)
  public name!: string;
}

class LibraryResolver {
  @Query(() => LibraryResult)
  public library(): LibraryResult {
    return {
      book: {},
    };
  }
}

@Resolver(Book)
class BooksResolver {
  @FieldResolver(() => Author)
  public async author(): Promise<string> {
    throw Error("This is a test error!");
  }
}

const server = new ApolloServer({
  schema: await buildSchema({
    resolvers: [LibraryResolver, BooksResolver],
    emitSchemaFile: true,
  }),
});
const standaloneServer = await startStandaloneServer(server);
console.log(`🚀 Server ready at ${standaloneServer.url}`);

async function pleaseDontCrash() {
  const result = await server.executeOperation({
    query: gql`
      query MyLibrary {
        library {
          book {
            author
            title
          }
        }
      }
    `,
  });

  console.log(JSON.stringify(result, null, 2));
  // assert(result.body.kind === "single");
  // assert(
  //   result.body.singleResult.errors?.[0]?.message === "This is a test error!",
  // );
}

pleaseDontCrash();
