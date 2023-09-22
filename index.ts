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
  });

  const server = new ApolloServer({
    schema: schema,
  });

  const result = await server.executeOperation({
    query: gql`
      query sigurdLibrary {
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
})();