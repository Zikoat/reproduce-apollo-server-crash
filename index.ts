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
import { gql } from "graphql-tag";
import { startStandaloneServer } from "@apollo/server/standalone";

@ObjectType()
class Book {
  @Field(() => String)
  public title?: string;
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
  public async author(): Promise<Author> {
    throw Error("This is a test error!");
  }
}

(async () => {
  const schema = await buildSchema({
    resolvers: [LibraryResolver, BooksResolver],
    emitSchemaFile: true,
  });

  const server = new ApolloServer({
    schema: schema,
  });

  // startServer(server)
  pleaseDontCrash(server);
})();

async function startServer(server: ApolloServer) {
  const { url } = await startStandaloneServer(server);
  console.log(`🚀 Server ready at ${url}`);
}

async function pleaseDontCrash(server: ApolloServer) {
  const result = await server.executeOperation({
    query: gql`
      query MyLibrary {
        library {
          book {
            author {
              name
            }
            title
          }
        }
      }
    `,
  });

  console.log(JSON.stringify(result, null, 2));
  assert(result.body.kind === "single");
  assert(
    result.body.singleResult.errors?.[0]?.message === "This is a test error!",
  );
}
