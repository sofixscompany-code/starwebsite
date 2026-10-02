import { useParams } from "react-router-dom";
import { LoadingSkeleton } from "@/components/prep/LoadingSkeleton";
import { PrepLayout } from "@/components/prep/PrepLayout";
import { usePrepCatalog } from "@/hooks/use-prep-data";
import { CourseSelection } from "./CourseSelection";
import { ModelSetDetail } from "./ModelSetDetail";
import { ModelSetList } from "./ModelSetList";
import { NotesList } from "./NotesList";
import { PostSelection } from "./PostSelection";
import { PrepNotFound } from "./PrepNotFound";
import { PreparationDashboard } from "./PreparationDashboard";
import { ServicesHome } from "./ServicesHome";
import { SyllabusPage } from "./SyllabusPage";

/**
 * Preparation Portal root — single route component for `/services/*`.
 * Parses the splat path and renders the matching flow step:
 *
 *   (empty)                          → ServicesHome
 *   :serviceSlug                     → CourseSelection
 *   :serviceSlug/:courseSlug         → PostSelection
 *   .../:postSlug                    → PreparationDashboard
 *   .../:postSlug/syllabus           → SyllabusPage
 *   .../:postSlug/notes              → NotesList
 *   .../:postSlug/model-set          → ModelSetList
 *   .../:postSlug/model-set/:id      → ModelSetDetail
 *   anything else                    → PrepNotFound
 */
export function PrepPortalPage() {
  const params = useParams();
  const segments = (params["*"] ?? "").split("/").filter(Boolean);
  const { services, courses, posts, notes, modelSets, isLoading } = usePrepCatalog();

  if (isLoading) {
    return (
      <PrepLayout>
        <LoadingSkeleton />
      </PrepLayout>
    );
  }

  // Slug resolution: service → course → post (each scoped to its parent id).
  const service = segments[0] ? services.find((s) => s.slug === segments[0]) : undefined;
  const course =
    service && segments[1]
      ? courses.find((c) => c.slug === segments[1] && c.serviceId === service.id)
      : undefined;
  const post =
    course && segments[2]
      ? posts.find((p) => p.slug === segments[2] && p.courseId === course.id)
      : undefined;

  const postNotes = post ? notes.filter((n) => n.postId === post.id) : [];
  const postModelSets = post ? modelSets.filter((m) => m.postId === post.id) : [];

  let content = <PrepNotFound />;

  switch (segments.length) {
    case 0:
      content = (
        <ServicesHome
          services={services}
          courses={courses}
          posts={posts}
          notes={notes}
          modelSets={modelSets}
        />
      );
      break;
    case 1:
      content = service ? <CourseSelection service={service} courses={courses} /> : content;
      break;
    case 2:
      content =
        service && course ? (
          <PostSelection service={service} course={course} posts={posts} />
        ) : (
          content
        );
      break;
    case 3:
      content =
        service && course && post ? (
          <PreparationDashboard service={service} course={course} post={post} />
        ) : (
          content
        );
      break;
    case 4: {
      if (service && course && post) {
        const section = segments[3];
        if (section === "syllabus") {
          content = <SyllabusPage service={service} course={course} post={post} />;
        } else if (section === "notes") {
          content = <NotesList service={service} course={course} post={post} notes={postNotes} />;
        } else if (section === "model-set") {
          content = (
            <ModelSetList service={service} course={course} post={post} modelSets={postModelSets} />
          );
        }
      }
      break;
    }
    case 5: {
      if (service && course && post && segments[3] === "model-set") {
        const modelSet = postModelSets.find((m) => m.id === segments[4]);
        if (modelSet) {
          content = (
            <ModelSetDetail service={service} course={course} post={post} modelSet={modelSet} />
          );
        }
      }
      break;
    }
    default:
      break;
  }

  return <PrepLayout>{content}</PrepLayout>;
}
