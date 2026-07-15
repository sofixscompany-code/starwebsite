
DROP POLICY IF EXISTS "Anyone can submit an admission" ON public.admissions;
CREATE POLICY "Anyone can submit an admission" ON public.admissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(trim(full_name)) BETWEEN 2 AND 120
    AND length(trim(phone)) BETWEEN 7 AND 20
    AND length(trim(address)) BETWEEN 3 AND 250
    AND length(trim(parent_name)) BETWEEN 2 AND 120
    AND length(trim(parent_phone)) BETWEEN 7 AND 20
    AND length(trim(course_title)) BETWEEN 2 AND 120
    AND status = 'pending'
    AND admission_number IS NULL
  );
