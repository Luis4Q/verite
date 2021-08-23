import {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextApiHandler,
  NextApiRequest
} from "next"
import { getSession } from "next-auth/client"
import { findUser, User } from "./database"

/**
 * Require authentication for a next.js page GetServerSideProps method
 *
 * @remark This method is a wrapper around your existing getServerSideProps method
 *
 * @example
 * export const getServerSideProps = requireAuth(async (context) => { ... })
 */
export function requireAuth<T>(
  getServerSideProps: GetServerSideProps<T>
): GetServerSideProps<T> {
  return async (context) => {
    const session = await getSession(context)

    if (!session || !session.user) {
      return {
        redirect: {
          destination: `/signin?redirectTo=${context.resolvedUrl}`,
          permanent: false
        }
      }
    }

    return getServerSideProps(context)
  }
}

/**
 * Require admin authentication for a next.js page GetServerSideProps method.
 *
 * @remark This method is a wrapper around your existing getServerSideProps method
 *
 * @example
 * export const getServerSideProps = requireAdmin(async (context) => { ... })
 */
export function requireAdmin<T>(
  getServerSideProps: GetServerSideProps<T>
): GetServerSideProps<T> {
  return requireAuth<T>(async (context) => {
    const user = await currentUser(context)

    if (user.role !== "admin") {
      return {
        redirect: {
          destination: `/`,
          permanent: false
        }
      }
    }

    return getServerSideProps(context)
  })
}

/**
 * Load the current user for a next.js page GetServerSideProps method
 *
 * @example
 * const user = await currentUser(context)
 */
export async function currentUser(
  context: GetServerSidePropsContext
): Promise<User | null> {
  const session = await getSession(context)

  if (session && session.user) {
    return findUser((session.user as User).id)
  }
}

export async function currentUser2(req: NextApiRequest): Promise<User | null> {
  const session = await getSession({ req })

  if (session && session.user) {
    return findUser((session.user as User).id)
  }
}
